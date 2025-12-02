import PgBoss, { DatabaseOptions } from 'pg-boss'
import cronstrue from 'cronstrue'
import { isValidCron } from 'cron-validator'
import { z } from 'zod'

import { getDbConnectionConfig } from '../db'
import logger from '../logger'
import internalLogger from '../logger/internals'

import { JobManagerError, JobManagerOptionsError } from './errors'
import wait from '../utils/wait'
import { readConfigurationFile } from '../utils/filesystem'
import defaultJobQueueNames from './defaultJobQueueNames'

const sendOptionsSchema = z.strictObject({
  startAfter: z.number().int().positive().optional(),
})

type SendOptions = z.infer<typeof sendOptionsSchema>

type JobManagerOptions = {
  exposeBossInstance?: boolean
}

const cron = z
  .string()
  .refine(val => isValidCron(val, { alias: true, seconds: false }), {
    message: 'Invalid cron string',
  })

const JobQueueName = z.string().refine(
  val => {
    const reservedQueueNames = Object.keys(defaultJobQueueNames).map(
      key => defaultJobQueueNames[key],
    )

    // reserving email, as it will be implemented
    const disallowed = [...reservedQueueNames, 'email']

    return !disallowed.includes(val.toLowerCase())
  },
  {
    message:
      'The provided string is a reserved job queue name and is not allowed.',
  },
)

const Timezone = z
  .string()
  .optional()
  .refine(
    val => {
      if (!val) return false

      try {
        new Intl.DateTimeFormat('en-US', { timeZone: val }).format()
        return true
      } catch (_error) {
        return false
      }
    },
    {
      message: 'Not a valid timezone.',
    },
  )

const JobHandlerArgumentsSchema = z.strictObject({
  id: z.string(),
  name: z.string(),
  data: z.any(),
  expire_in_seconds: z.string(),
})

export type JobHandlerArguments = z.infer<typeof JobHandlerArgumentsSchema>

const JobQueueSchema = z.strictObject({
  name: JobQueueName,
  handler: z.function().input([JobHandlerArgumentsSchema]),
  teamSize: z.number().int().positive().optional(),
  teamConcurrency: z.number().int().positive().optional(),
  schedule: cron.optional(),
  scheduleTimezone: Timezone.optional(),
})

const JobQueuesArraySchema = z.array(JobQueueSchema)

type JobQueue = z.infer<typeof JobQueueSchema>

class JobManager {
  #boss: PgBoss
  // Exposing the boss instance can be used for testing
  #exposeBossInstance: boolean

  constructor(options: JobManagerOptions = {}) {
    this.#exposeBossInstance = options.exposeBossInstance
  }

  get boss(): PgBoss {
    if (!this.#exposeBossInstance) {
      throw new JobManagerError(
        "Access denied: 'boss' property was not exposed during JobManager initialization.",
      )
    }

    return this.#boss
  }

  async init(passedQueues: JobQueue[] = []): Promise<void> {
    internalLogger.section('Set up job manager')

    const connectionConfig = getDbConnectionConfig()
    const bossInstance = new PgBoss(connectionConfig as DatabaseOptions)
    this.#boss = bossInstance
    this.#boss.on('error', error => logger.error(error))
    await this.#boss.start()
    internalLogger.success('Connected to job queue')

    internalLogger.section('Register built-in job queues')
    const { defaultJobQueues } = await import('./defaultJobQueues')
    await this.#registerQueues(defaultJobQueues, false)

    internalLogger.point('Registering custom job queues')

    const jobQueuesFile = await readConfigurationFile('jobQueues')
    let queues = jobQueuesFile?.default || []

    try {
      JobQueuesArraySchema.parse(queues)
    } catch (e) {
      throw new JobManagerError(`Malformed jobQueues file: ${e}`)
    }

    if (passedQueues) queues = [...queues, ...passedQueues]

    if (queues.length === 0) {
      internalLogger.point('No custom job queues found', 2)
    }

    await this.#registerQueues(queues)

    internalLogger.point('Cleaning up orphaned schedules')

    const schedules = await this.#boss.getSchedules()
    let orphanFound = false

    await Promise.all(
      schedules.map(async schedule => {
        const queue = queues.find(q => q.name === schedule.name)

        if (!queue) {
          orphanFound = true
          await this.#boss.unschedule(schedule.name)

          internalLogger.success(
            `Removed schedule on queue "${schedule.name}", as queue definition no longer exists.`,
            2,
          )
        }

        if (queue && !queue.schedule) {
          orphanFound = true
          await this.#boss.unschedule(schedule.name)

          internalLogger.success(
            `Removed schedule on queue "${schedule.name}", as schedule option no longer exists on queue definition.`,
            2,
          )
        }
      }),
    )

    if (!orphanFound) {
      internalLogger.point('No orphaned schedules found', 2)
    }
  }

  async #registerQueues(queues, indent: boolean = true): Promise<void> {
    await Promise.all(
      queues.map(async (q: JobQueue) => {
        const options = {} as JobQueue

        if (q.teamSize) options.teamSize = q.teamSize
        if (q.teamConcurrency) options.teamConcurrency = q.teamConcurrency

        const handler = async (job: JobHandlerArguments): Promise<any> =>
          q.handler(job)

        await this.#boss.work(q.name, options, handler)
        internalLogger.success(`Registered queue "${q.name}"`, indent ? 2 : 0)

        if (q.schedule) {
          const scheduleOptions = {} as PgBoss.ScheduleOptions

          if (q.scheduleTimezone) scheduleOptions.tz = q.scheduleTimezone

          await this.#boss.schedule(q.name, q.schedule, null, scheduleOptions)

          const readablePattern = cronstrue.toString(q.schedule, {
            verbose: true,
          })

          internalLogger.success(
            `Set up schedule on queue "${
              q.name
            }" to run: ${readablePattern}, in the ${
              q.scheduleTimezone || 'UTC'
            } timezone`,
            4,
          )
        }
      }),
    )
  }

  async stop(options): Promise<void> {
    internalLogger.section('Shut down job manager')
    await this.#boss.stop(options)

    /**
     * await boss.stop() doesn't wait until boss is in a stopped state,
     * so we're trapping the function until boss.stopped is true
     */

    const pollingInterval = 100
    const timeout = 5000
    const endTime = Date.now() + timeout

    while (true) {
      // @ts-ignore
      if (this.#boss.stopped) {
        internalLogger.success('Successfully shut down job manager')
        break
      }

      if (Date.now() >= endTime) {
        internalLogger.success(
          `Job manager shutdown timed out after ${timeout} ms`,
        )
        break
      }

      /* eslint-disable-next-line no-await-in-loop */
      await wait(pollingInterval)
    }
  }

  async sendToQueue(
    queueName: string,
    data,
    options: SendOptions = {},
  ): Promise<void> {
    try {
      sendOptionsSchema.parse(options)
    } catch (error) {
      throw new JobManagerOptionsError(error.message)
    }

    await this.#boss.send(queueName, data, options)
  }
}

const jobManager = new JobManager()

export { JobManager, jobManager }

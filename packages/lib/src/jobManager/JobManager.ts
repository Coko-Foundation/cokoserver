import {
  ConstructorOptions,
  Job,
  PgBoss,
  ScheduleOptions,
  WorkOptions,
} from 'pg-boss'
import cronstrue from 'cronstrue'
import { isValidCron } from 'cron-validator'
import { z } from 'zod'
import isMatch from 'lodash/isMatch'

import { db, getDbConnectionConfig, migrationsMeta } from '../db'
import logger from '../logger'
import internalLogger from '../logger/internals'

import { JobManagerError, JobManagerOptionsError } from './errors'
import wait from '../utils/wait'
import { readConfigurationFile } from '../utils/filesystem'
import defaultJobQueueNames from './defaultJobQueueNames'
import { defaultJobQueues } from './defaultJobQueues'

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
})

export type JobHandlerArguments = z.infer<typeof JobHandlerArgumentsSchema>

const JobQueueSchema = z.strictObject({
  name: JobQueueName,
  handler: z.function().input([JobHandlerArgumentsSchema]),
  batchSize: z.number().int().positive().optional(),
  concurrency: z.number().int().positive().optional(),
  schedule: cron.optional(),
  scheduleTimezone: Timezone.optional(),
})

const JobQueuesArraySchema = z.array(JobQueueSchema)

export type JobQueue = z.infer<typeof JobQueueSchema>

type WaitOptions = {
  interval?: number
  timeout?: number
}

const newSchemaName = 'pgboss_v12'

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

    const bossInstance = new PgBoss({
      schema: newSchemaName,
      ...connectionConfig,
    } as ConstructorOptions)

    this.#boss = bossInstance
    this.#boss.on('error', error => logger.error(error))
    await this.#boss.start()
    internalLogger.success('Connected to job queue')

    internalLogger.section('Register built-in job queues')
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

    await this.#migrate()
  }

  async #migrate(): Promise<void> {
    const metaTableData = await migrationsMeta.getData()

    if (metaTableData.pgBossSchema === newSchemaName) {
      internalLogger.point(
        'Job queue schema unchanged, no migration necessary.',
      )
      return
    }

    const existingSchema = metaTableData.pgBossSchema || 'pgboss'

    internalLogger.point(
      `Migrating job queues from existing schema '${existingSchema}' to new schema '${newSchemaName}'`,
    )

    const existingTableExists = await db.schema
      .withSchema(existingSchema)
      .hasTable('job')

    if (!existingTableExists) {
      internalLogger.point(
        'There is no existing job queue table to migrate from.',
      )
      return
    }

    const queues = await this.#boss.getQueues()

    for (const queue of queues) {
      try {
        const sql = `
            INSERT INTO ${newSchemaName}.job (
                id,
                name,
                priority,
                data,
                retry_limit,
                retry_count,
                retry_delay,
                retry_backoff,
                start_after,
                singleton_key,
                singleton_on,
                expire_seconds,
                created_on,
                keep_until,
                output,
                policy
            )
            SELECT 
                id,
                name,
                priority,
                data,
                retryLimit,
                retryCount,
                retryDelay,
                retryBackoff,
                startAfter,
                singletonKey,
                singletonOn,
                EXTRACT(EPOCH FROM expireIn)::integer,
                createdOn,
                keepUntil,
                output jsonb,
                '${queue.policy}' as policy
            FROM ${existingSchema}.job
            WHERE name = '${queue.name}'
                AND state = 'created'
            ON CONFLICT DO NOTHING
        `

        /* eslint-disable-next-line no-await-in-loop */
        const { rowCount } = await db.raw(sql)

        if (rowCount) {
          internalLogger.success(
            `Migrated ${rowCount} job${rowCount > 1 ? 's' : ''} in queue ${queue.name}`,
            2,
          )
        }
      } catch (error) {
        throw new JobManagerError(
          `Migration error while copying jobs from '${queue.name}': ${error.message}`,
        )
      }
    }

    await migrationsMeta.setPgBossSchema(newSchemaName)
    internalLogger.success(`Saved applied job queue schema: ${newSchemaName}.`)
  }

  async #registerQueues(queues, indent: boolean = true): Promise<void> {
    await Promise.all(
      queues.map(async (q: JobQueue) => {
        const options = {} as WorkOptions

        if (q.batchSize) options.batchSize = q.batchSize
        if (q.concurrency) options.localConcurrency = q.concurrency

        const handler = async (jobs: Job[]): Promise<any> => {
          const [job] = jobs
          return q.handler(job)
        }

        const exists = await this.#boss.getQueue(q.name)
        if (!exists) await this.#boss.createQueue(q.name)

        await this.#boss.work(q.name, options, handler)
        internalLogger.success(`Registered queue "${q.name}"`, indent ? 2 : 0)

        if (q.schedule) {
          const scheduleOptions = {} as ScheduleOptions

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

  async stop(): Promise<void> {
    internalLogger.section('Shut down job manager')
    await this.#boss.stop()

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

  async getQueueSize(queueName: string): Promise<number> {
    const stats = await this.#boss.getQueueStats(queueName)
    return stats.queuedCount + stats.activeCount
  }

  /* eslint-disable-next-line class-methods-use-this */
  async waitForJobsToFinish(
    queueName: string,
    filterData,
    options: WaitOptions = {},
  ): Promise<void> {
    const interval = options.interval || 500
    const timeout = options.timeout || 60000

    return new Promise((resolve, reject) => {
      let intervalId
      let timeoutId

      async function checkIsDone(): Promise<void> {
        try {
          const res = await db.raw(`
            SELECT
              id,
              name,
              state,
              data
            FROM
              ${newSchemaName}.job
            WHERE
              name = '${queueName}'
          `)

          const match = res.rows.filter(row => isMatch(row.data, filterData))

          if (match.length === 0) {
            throw new Error(
              `No jobs match the filter ${JSON.stringify(filterData)}`,
            )
          }

          const pending = match.filter(row => row.state === 'created')
          if (pending.length > 0) return

          const active = match.filter(row => row.state === 'active')
          if (active.length > 0) return

          clearInterval(intervalId)
          clearTimeout(timeoutId)
          resolve()
        } catch (e) {
          clearInterval(intervalId)
          clearTimeout(timeoutId)
          reject(e)
        }
      }

      intervalId = setInterval(checkIsDone, interval)

      timeoutId = setTimeout(() => {
        clearInterval(intervalId)
        reject(
          new Error(
            `Job in queue "${queueName}" with data matching ${JSON.stringify(
              filterData,
            )} did not complete before timeout of ${timeout} ms.`,
          ),
        )
      }, timeout)
    })
  }

  async waitForQueueToEmpty(
    queueName: string,
    options: WaitOptions = {},
  ): Promise<void> {
    const interval = options.interval || 500
    const timeout = options.timeout || 60000
    const self = this

    return new Promise((resolve, reject) => {
      let intervalId
      let timeoutId

      async function checkIsEmpty(): Promise<void> {
        try {
          const size = await self.getQueueSize(queueName)

          if (size === 0) {
            clearInterval(intervalId)
            clearTimeout(timeoutId)
            resolve()
          }
        } catch (e) {
          clearInterval(intervalId)
          clearTimeout(timeoutId)
          reject(e)
        }
      }

      intervalId = setInterval(checkIsEmpty, interval)

      timeoutId = setTimeout(() => {
        clearInterval(intervalId)
        reject(
          new Error(
            `Waiting for queue ${queueName} to empty timed out after ${timeout} ms.`,
          ),
        )
      }, timeout)
    })
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

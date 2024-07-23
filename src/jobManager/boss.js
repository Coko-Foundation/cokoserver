const PgBoss = require('pg-boss')
const cronstrue = require('cronstrue')

const getConnectionConfig = require('../dbManager/connectionConfig')
const logger = require('../logger')
const { logTask, logTaskItem, logTaskSubItem } = require('../logger/internals')
const wait = require('../utils/wait')

const { defaultJobQueues } = require('./defaultJobQueues')

const connectionConfig = getConnectionConfig()

const boss = new PgBoss(connectionConfig)
boss.on('error', error => logger.error(error))

const registerQueues = async (queues, config) => {
  await Promise.all(
    queues.map(async q => {
      const options = {}
      if (q.teamSize) options.teamSize = q.teamSize
      if (q.teamConcurrency) options.teamConcurrency = q.teamConcurrency
      const handler = job => q.handler(job, { config })

      await boss.work(q.name, options, handler)
      logTaskSubItem(`Registered queue "${q.name}"`)

      if (q.schedule) {
        const scheduleOptions = {}
        if (q.scheduleTimezone) scheduleOptions.tz = q.scheduleTimezone

        await boss.schedule(q.name, q.schedule, null, scheduleOptions)

        const readablePattern = cronstrue.toString(q.schedule, {
          verbose: true,
        })

        logTaskSubItem(
          `Set up schedule on queue "${
            q.name
          }" to run: ${readablePattern}, in the ${
            q.scheduleTimezone || 'UTC'
          } timezone`,
        )
      }
    }),
  )
}

const start = async config => {
  logTask('Set up job manager')

  await boss.start()
  logTaskItem('Connected to job queue')

  logTaskItem('Register built-in job queues')
  await registerQueues(defaultJobQueues, config)

  logTaskItem('Registering custom job queues')

  const queues = (config.has('jobQueues') && config.get('jobQueues')) || []

  if (queues.length === 0) {
    logTaskSubItem('No custom job queues found')
  }

  await registerQueues(queues, config)

  logTaskItem('Cleaning up orphaned schedules')

  const schedules = await boss.getSchedules()
  let orphanFound = false

  await Promise.all(
    schedules.map(async schedule => {
      const queue = queues.find(q => q.name === schedule.name)

      if (!queue) {
        orphanFound = true
        await boss.unschedule(schedule.name)
        logTaskSubItem(
          `Removed schedule on queue "${schedule.name}", as queue definition no longer exists.`,
        )
      }

      if (queue && !queue.schedule) {
        orphanFound = true
        await boss.unschedule(schedule.name)
        logTaskSubItem(
          `Removed schedule on queue "${schedule.name}", as schedule option no longer exists on queue definition.`,
        )
      }
    }),
  )

  if (!orphanFound) logTaskSubItem('No orphaned schedules found')
}

const stop = async () => {
  logTask('Shut down job manager')
  await boss.stop()

  /**
   * await boss.stop() doesn't wait until boss is in a stopped state,
   * so we're trapping the function until boss.stopped is true
   */

  const pollingInterval = 100
  const timeout = 5000
  const endTime = Date.now() + timeout

  while (true) {
    if (boss.stopped) {
      logTaskItem('Successfully shut down job manager')
      break
    }

    if (Date.now() >= endTime) {
      logTaskItem(`Job manager shutdown timed out after ${timeout} ms`)
      break
    }

    /* eslint-disable-next-line no-await-in-loop */
    await wait(pollingInterval)
  }
}

// These exports are meant for internal module consumption
// For exports outside of the job manager module, use index.js
module.exports = {
  boss,
  start,
  stop,
}

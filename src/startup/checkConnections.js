const config = require('config')

const db = require('../dbManager/db')
const { logTask, logTaskItem, logErrorTask } = require('../logger/internals')
const fileStorage = require('../fileStorage')

const sleep = ms =>
  new Promise(resolve => {
    setTimeout(resolve, ms)
  })

const checkDbConnection = async () => {
  const retries = 5
  const iterable = Array.from({ length: retries }, (_, i) => i + 1)

  /**
   * Use for of deliberately, so that each iteration awaits before moving to
   * the next one.
   */

  /* eslint-disable-next-line no-restricted-syntax */
  for (const attempt of iterable) {
    try {
      /* eslint-disable-next-line no-await-in-loop */
      await db.raw('SELECT 1+1 AS result')
      logTaskItem('Database connection successful')
      break
    } catch (e) {
      if (attempt === retries) {
        logErrorTask('Could not establish connection to the database')
        throw new Error(e)
      } else {
        // console.log(`attempt ${attempt} failed. retrying...`)
        const timeout = attempt * 1000
        /* eslint-disable-next-line no-await-in-loop */
        await sleep(timeout)
      }
    }
  }
}

const checkConnections = async () => {
  logTask('Checking external connections')

  await checkDbConnection()

  if (config.has('useFileStorage') && config.get('useFileStorage')) {
    try {
      await fileStorage.healthCheck()
      logTaskItem('File storage connection successful')
    } catch (e) {
      logErrorTask('Could not establish connection to file storage')
      throw e
    }
  } else {
    logTaskItem(
      "Skipping file storage. Set 'useFileStorage' to true to enable.",
    )
  }
}

module.exports = {
  // checkDbConnection,
  checkConnections,
}

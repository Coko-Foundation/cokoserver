import config from '../configManager/config'
import db from '../db/db'
import { logTask, logTaskItem, logErrorTask } from '../logger/internals'
import fileStorage from '../fileStorage'

const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => {
    setTimeout(resolve, ms)
  })

const checkDbConnection = async (): Promise<void> => {
  const retries = 5
  const iterable = Array.from({ length: retries }, (_, i) => i + 1)

  /**
   * Use for of deliberately, so that each iteration awaits before moving to
   * the next one.
   */

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

const checkConnections = async (): Promise<void> => {
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

export {
  // checkDbConnection,
  checkConnections,
}

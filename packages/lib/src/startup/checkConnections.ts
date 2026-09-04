import config from '../configManager/config'
import db from '../db/db'
import internalLogger from '../logger/internals'
import fileStorage from '../fileStorage'

class DatabaseConnectionError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'DatabaseConnectionError'
  }
}

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
      if (attempt > 1) {
        internalLogger.wait(
          `Connecting to database: Attempt ${attempt}/${retries}`,
        )
      }

      /* eslint-disable-next-line no-await-in-loop */
      await db.raw('SELECT 1+1 AS result')
      internalLogger.success('Database connection successful')
      break
    } catch (e) {
      if (attempt === retries) {
        internalLogger.error('Could not establish connection to the database')
        throw new DatabaseConnectionError(e.message)
      } else {
        const timeout = attempt * 1000
        /* eslint-disable-next-line no-await-in-loop */
        await sleep(timeout)
      }
    }
  }
}

const checkConnections = async (): Promise<void> => {
  internalLogger.section('Checking external connections')

  await checkDbConnection()

  if (config.get('fileStorage')) {
    try {
      await fileStorage.healthCheck()
      internalLogger.success('File storage connection successful')
    } catch (e) {
      internalLogger.error('Could not establish connection to file storage')
      throw e
    }
  } else {
    internalLogger.warn('Skipping file storage as it is disabled')
  }
}

export {
  // checkDbConnection,
  checkConnections,
}

import { env } from '../utils/env'

global.console.debug = (...args: any[]): void => global.console.log(args)
const logger = global.console

/**
 * Do not use config here, as config itself imports the logger, creating a
 * circular dependency.
 */

const isTest = process.env.NODE_ENV === 'test'
const suppress =
  isTest && env('SUPPRESS_LOGGER_IN_TEST_ENV', { type: 'boolean' })

export default {
  error: (...args: any[]): void => {
    if (suppress) return
    logger.error(...args)
  },
  warn: (...args: any[]): void => {
    if (suppress) return
    logger.warn(...args)
  },
  info: (...args: any[]): void => {
    if (suppress) return
    logger.info(...args)
  },
  debug: (...args: any[]): void => {
    if (suppress) return
    logger.debug(...args)
  },
}

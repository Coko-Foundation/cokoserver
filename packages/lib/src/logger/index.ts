import config from '../configManager/config'

global.console.debug = (...args: any[]): void => global.console.log(args)
const logger = global.console
const isTest = process.env.NODE_ENV === 'test'
const suppress = isTest && config.get('suppressLoggerInTestEnv')

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

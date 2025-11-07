import config from '../configManager/config'

global.console.debug = (...args: any[]): void => global.console.log(args)
const logger = global.console

export default {
  error: (...args: any[]): void => {
    if (config.get('suppressLoggerInTestEnv')) return
    logger.error(...args)
  },
  warn: (...args: any[]): void => {
    if (config.get('suppressLoggerInTestEnv')) return
    logger.warn(...args)
  },
  info: (...args: any[]): void => {
    if (config.get('suppressLoggerInTestEnv')) return
    logger.info(...args)
  },
  debug: (...args: any[]): void => {
    if (config.get('suppressLoggerInTestEnv')) return
    logger.debug(...args)
  },
}

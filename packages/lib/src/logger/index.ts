import config from '../configManager/config'

global.console.debug = (...args) => global.console.log(args)
const logger = global.console

export default {
  error: (...args) => {
    if (config.get('suppressLoggerInTestEnv')) return
    logger.error(...args)
  },
  warn: (...args) => {
    if (config.get('suppressLoggerInTestEnv')) return
    logger.warn(...args)
  },
  info: (...args) => {
    if (config.get('suppressLoggerInTestEnv')) return
    logger.info(...args)
  },
  debug: (...args) => {
    if (config.get('suppressLoggerInTestEnv')) return
    logger.debug(...args)
  },
}

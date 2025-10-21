process.env.SUPPRESS_NO_CONFIG_WARNING = true

global.console.debug = (...args) => global.console.log(args)
const logger = global.console

module.exports = {
  error: (...args) => logger.error(...args),
  warn: (...args) => logger.warn(...args),
  info: (...args) => logger.info(...args),
  debug: (...args) => logger.debug(...args),
}

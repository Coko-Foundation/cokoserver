process.env.SUPPRESS_NO_CONFIG_WARNING = true

const config = require('config')

let loggerConfig

if (config.has('logger')) {
  loggerConfig = config.get('logger')
}

let logger = loggerConfig
let configured = Boolean(logger)

if (!configured) {
  global.console.debug = (...args) => global.console.log(args)
  logger = global.console
}

module.exports = {
  error: (...args) => logger.error(...args),
  warn: (...args) => logger.warn(...args),
  info: (...args) => logger.info(...args),
  debug: (...args) => logger.debug(...args),
  stream: {
    write(message, encoding) {
      logger.info(message)
    },
  },
  configure: theirLogger => {
    if (configured) {
      throw new Error('Logger has already been configured')
    }

    logger = theirLogger
    configured = true
  },
  getRawLogger: () => logger,
}

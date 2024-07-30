const checkConfig = require('../startup/checkConfig')

class TestConfig {
  constructor(configObject = {}, optionOverrides = {}) {
    const options = {
      useDb: false,
      suppressLogs: true,
      ...optionOverrides,
    }

    const dbData = options.useDb
      ? {
          db: {
            user: process.env.POSTGRES_USER,
            password: process.env.POSTGRES_PASSWORD,
            host: process.env.POSTGRES_HOST,
            database: process.env.POSTGRES_DB,
            port: process.env.POSTGRES_PORT,
          },
        }
      : {}

    const suppressedLogs = options.suppressLogs
      ? {
          logger: {
            info: () => {},
            error: () => {},
            debug: () => {},
            warn: () => {},
          },
        }
      : {}

    const data = {
      ...dbData,
      ...suppressedLogs,
      ...configObject,
    }

    this.config = data
    checkConfig(this.config)
  }

  get(key) {
    return this.config[key]
  }

  has(key) {
    return Object.prototype.hasOwnProperty.call(this.config, key)
  }
}

module.exports = TestConfig

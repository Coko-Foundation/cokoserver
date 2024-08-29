const { logTask, logTaskItem } = require('../logger/internals')
const validateConfig = require('../utils/validateConfig')

/**
 * Break this up from check config to avoid circular dependencies when using
 * the TestConfig class, where check config requires logger internals, which
 * requires the looger index, which requires config.
 */

const check = config => {
  logTask('Checking configuration')

  validateConfig(config)

  logTaskItem('Configuration check complete')
}

module.exports = check

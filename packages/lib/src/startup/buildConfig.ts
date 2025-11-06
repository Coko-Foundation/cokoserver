import { logTask, logTaskItem } from '../logger/internals'
import validateConfig from '../utils/validateConfig'

/**
 * Break this up from check config to avoid circular dependencies when using
 * the TestConfig class, where check config requires logger internals, which
 * requires the looger index, which requires config.
 */
const buildConfig = config => {
  logTask('Checking configuration')

  validateConfig(config)

  logTaskItem('Configuration check complete')
}

export default buildConfig

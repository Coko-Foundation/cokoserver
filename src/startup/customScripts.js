const config = require('config')

const { logTask, logTaskItem, logErrorTask } = require('../logger/internals')

const STARTUP_KEY = 'onStartup'

const runCustomStartupScripts = async () => {
  logTask('Run custom startup functions')

  if (
    !config.has(STARTUP_KEY) ||
    !Array.isArray(config.get(STARTUP_KEY)) ||
    config.get(STARTUP_KEY).length === 0
  ) {
    logTaskItem('No custom startup functions provided')
    return
  }

  const items = config.get(STARTUP_KEY)

  // Use for...of as we explicitly want to wait for each script to finish before
  // moving on to the next one

  /* eslint-disable-next-line no-restricted-syntax */
  for (const item of items) {
    const { label, execute } = item

    logTaskItem(`Executing '${label}'`)

    try {
      /* eslint-disable-next-line no-await-in-loop */
      await execute()
    } catch (e) {
      logErrorTask(`Error while executing '${label}': ${e.message}`)
      throw e
    }
  }
}

module.exports = {
  runCustomStartupScripts,
}

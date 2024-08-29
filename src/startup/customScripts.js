const config = require('config')

const { logTask, logTaskItem, logErrorTask } = require('../logger/internals')

const STARTUP_KEY = 'onStartup'
const SHUTDOWN_KEY = 'onShutdown'

const runCustomScripts = async (name, configKey) => {
  logTask(`Run custom ${name} functions`)

  if (
    !config.has(configKey) ||
    !Array.isArray(config.get(configKey)) ||
    config.get(configKey).length === 0
  ) {
    logTaskItem(`No custom ${name} functions provided`)
    return
  }

  const items = config.get(configKey)

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

const runCustomStartupScripts = async () =>
  runCustomScripts('startup', STARTUP_KEY)

const runCustomShutdownScripts = async () =>
  runCustomScripts('shutdown', SHUTDOWN_KEY)

module.exports = {
  runCustomStartupScripts,
  runCustomShutdownScripts,
}

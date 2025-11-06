import { z } from 'zod'

import { logTask, logTaskItem, logErrorTask } from '../logger/internals'
import { findConfigurationFile } from '../utils/filesystem'

const STARTUP_KEY = 'onStartup'
const SHUTDOWN_KEY = 'onShutdown'

const LifeCycleScriptSchema = z.object({
  label: z.string(),
  execute: z.function(),
})

const LifeCycleArraySchema = z.array(LifeCycleScriptSchema)

const runCustomScripts = async (
  name: string,
  configKey: string,
): Promise<void> => {
  logTask(`Run custom ${name} functions`)

  const filePath = findConfigurationFile(name)

  if (!filePath) {
    logTaskItem(`No ${name} tasks file found.`)
    return
  }

  const { default: items } = await import(filePath)

  try {
    LifeCycleArraySchema.parse(items)
  } catch (e) {
    logErrorTask(`Incorrect shape exported from file ${filePath}.`)
    throw e
  }

  if (items.length === 0) {
    logTaskItem(`No custom ${name} functions provided`)
    return
  }

  // Use for...of as we explicitly want to wait for each script to finish before moving on to the next one
  for (const item of items) {
    const { label, execute } = item

    logTaskItem(`Executing '${label}'`)

    try {
      /* eslint-disable-next-line no-await-in-loop */
      await execute()
    } catch (e) {
      if (e instanceof Error) {
        logErrorTask(`Error while executing '${label}': ${e.message}`)
      }

      throw e
    }
  }
}

const runCustomStartupScripts = async (): Promise<void> =>
  runCustomScripts('startup', STARTUP_KEY)

const runCustomShutdownScripts = async (): Promise<void> =>
  runCustomScripts('shutdown', SHUTDOWN_KEY)

export { runCustomStartupScripts, runCustomShutdownScripts }

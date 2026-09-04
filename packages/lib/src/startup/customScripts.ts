import { z } from 'zod'

import internalLogger from '../logger/internals'
import { findConfigurationFile } from '../utils/filesystem'

const LifeCycleScriptSchema = z.object({
  label: z.string(),
  execute: z.function(),
})

const LifeCycleArraySchema = z.array(LifeCycleScriptSchema)

const runCustomScripts = async (name: string): Promise<void> => {
  internalLogger.section(`Run custom ${name} functions`)

  const filePath = findConfigurationFile(name)

  if (!filePath) {
    internalLogger.point(`No ${name} file found.`)
    return
  }

  const { default: items } = await import(filePath)

  try {
    LifeCycleArraySchema.parse(items)
  } catch (e) {
    internalLogger.error(`Incorrect shape exported from file ${filePath}.`)
    throw e
  }

  if (items.length === 0) {
    internalLogger.point(`No custom ${name} functions provided`)
    return
  }

  // Use for...of as we explicitly want to wait for each script to finish before moving on to the next one
  for (const item of items) {
    const { label, execute } = item

    internalLogger.point(`Executing '${label}'`)

    try {
      /* eslint-disable-next-line no-await-in-loop */
      await execute()
    } catch (e) {
      if (e instanceof Error) {
        internalLogger.error(`Error while executing '${label}': ${e.message}`)
      }

      throw e
    }
  }
}

const runCustomStartupScripts = async (): Promise<void> =>
  runCustomScripts('startup')

const runCustomShutdownScripts = async (): Promise<void> =>
  runCustomScripts('shutdown')

export { runCustomStartupScripts, runCustomShutdownScripts }

import path from 'path'

import fs from 'fs-extra'
import { z } from 'zod'
import mergeWith from 'lodash/mergeWith'

import BuilderConfigError from './BuilderConfigError'
import internalLogger from '../logger/internals'

const builderConfigSchema = z.strictObject({
  devServer: z.strictObject({
    ignore: z.array(z.string()),
    inspectorPort: z.number().int().positive(),
  }),
  assetExtensions: z.array(z.string()),
})

type BuilderConfig = z.infer<typeof builderConfigSchema>

const DEFAULT_CONFIG = {
  devServer: {
    ignore: ['./tmp/*'],
    inspectorPort: 9229,
  },
  assetExtensions: ['json', 'graphql'],
}

function arrayCustomizer(objValue, srcValue): any[] | undefined {
  if (Array.isArray(objValue) && Array.isArray(srcValue)) {
    return objValue.concat(srcValue)
  }

  return undefined
}

function defineBuilderConfig(): BuilderConfig {
  const configPath = path.join(process.cwd(), 'builder.json')

  if (!fs.existsSync(configPath)) {
    internalLogger.builder(
      'Configuration file "builder.json" not found. Using default configuration.',
    )

    return DEFAULT_CONFIG
  }

  // read
  let fileConfig

  try {
    const fileContents = fs.readFileSync(configPath, 'utf8')
    fileConfig = JSON.parse(fileContents)
  } catch (e) {
    throw new BuilderConfigError(e.message)
  }

  // merge
  const merged = mergeWith(DEFAULT_CONFIG, fileConfig, arrayCustomizer)

  // validate
  builderConfigSchema.parse(merged)

  return merged
}

function loadBuilderConfig(): BuilderConfig {
  const config = defineBuilderConfig()
  internalLogger.builder(`Ignored files: ${config.devServer.ignore}`)
  return config
}

export default loadBuilderConfig

import path from 'path'

import fs from 'fs-extra'
import Joi from 'joi'
import mergeWith from 'lodash/mergeWith'

import BuilderConfigError from './BuilderConfigError'
import logger from '../logger/index'

const configSchema = Joi.object({
  buildPath: Joi.string(),
  configPath: Joi.string(),
  devServer: Joi.object({
    ignore: Joi.array().items(Joi.string()),
    inspectorPort: Joi.number().integer().positive(),
  }),
}).required()

const DEFAULT_CONFIG = {
  buildPath: `${process.cwd()}/**/*`,
  devServer: {
    ignore: ['./tmp/*'],
    inspectorPort: 9229,
  },
}

function arrayCustomizer(objValue, srcValue) {
  if (Array.isArray(objValue) && Array.isArray(srcValue)) {
    return objValue.concat(srcValue)
  }

  return undefined
}

function defineBuilderConfig() {
  const configPath = path.join(process.cwd(), 'builder.json')

  if (!fs.existsSync(configPath)) {
    logger.info(
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
  const { error } = configSchema.validate(merged, {
    abortEarly: false,
  })

  if (error) throw new BuilderConfigError(error.message)
  return merged
}

function loadBuilderConfig() {
  const config = defineBuilderConfig()
  return config
}

export default loadBuilderConfig

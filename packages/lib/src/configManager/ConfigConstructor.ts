import get from 'lodash/get'
import has from 'lodash/has'
import isEmpty from 'lodash/isEmpty'
import mergeWith from 'lodash/mergeWith'
import { ZodObject } from 'zod'

import { findConfigurationFile } from '../utils/filesystem'
import defaultConfig from './defaultConfig'
import { ConfigSchema, ConfigType } from './configSchema'
import { ConfigSchemaError, ConfigUnknownPropertyError } from './errors'
import logger from '../logger'

function arrayCustomizer(objValue: any, srcValue: any): any[] | undefined {
  if (Array.isArray(objValue) && Array.isArray(srcValue)) {
    return objValue.concat(srcValue)
  }

  return undefined
}

function extractOptions(schema: ZodObject, parent: string[] = []): string[] {
  if (!schema.keyof) return []
  const paths = []

  let keys = schema.keyof().options
  if (parent) keys = keys.map(k => [...parent, k].join('.'))
  paths.push(...keys)

  for (const key of Object.keys(schema.shape)) {
    const item = schema.shape[key]

    if (item.keyof) {
      paths.push(...extractOptions(item, [...parent, key]))
    } else if (item.def?.innerType?.keyof) {
      paths.push(...extractOptions(item.def.innerType, [...parent, key]))
    } else if (item.type === 'union') {
      item.options.forEach(option => {
        paths.push(...extractOptions(option, [...parent, key]))
      })
    }
  }

  return paths.sort()
}

export default class Config {
  #values: ConfigType
  #allowedKeys: string[]

  constructor() {
    this.#values = defaultConfig
  }

  async init(overrideValues?: Partial<ConfigType>): Promise<void> {
    const { default: loadBuilderConfig } =
      await import('../cli/loadBuilderConfig')

    const builderConfig = loadBuilderConfig()

    const configPath = findConfigurationFile('config', {
      basePath: builderConfig.configPath,
    })

    let providedConfig = {}

    if (configPath) {
      const { default: importedConfig } = await import(configPath)
      providedConfig = importedConfig
    } else {
      logger.warn('No config file found')
    }

    this.#values = mergeWith(
      {},
      defaultConfig,
      providedConfig,
      overrideValues,
      arrayCustomizer,
    )

    this.#allowedKeys = extractOptions(ConfigSchema)

    Object.freeze(this)
  }

  reset(): void {
    this.#values = defaultConfig
  }

  get values(): ConfigType {
    return Object.freeze(this.#values)
  }

  get(key: string): any {
    if (!this.#allowedKeys.includes(key)) {
      throw new ConfigUnknownPropertyError(key)
    }

    return get(this.#values, key)
  }

  has(key: string): boolean {
    return has(this.#values, key) && !isEmpty(get(this.#values, key))
  }

  validate(): void {
    try {
      ConfigSchema.parse(this.#values)
    } catch (e) {
      throw new ConfigSchemaError(e)
    }
  }
}

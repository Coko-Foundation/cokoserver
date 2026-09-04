import get from 'lodash/get'
import has from 'lodash/has'
import isEmpty from 'lodash/isEmpty'
import mergeWith from 'lodash/mergeWith'
import { z, ZodObject } from 'zod'

import { readConfigurationFile } from '../utils/filesystem'
import defaultConfig from './defaultConfig'
import { ConfigSchema as defaultSchema, ConfigType } from './configSchema'
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
    let providedSchema = z.object({})
    const providedSchemaFile = await readConfigurationFile('configSchema')

    if (!providedSchemaFile) {
      logger.warn('No config schema file')
    } else {
      providedSchema = providedSchemaFile.default
    }

    const schema = z.strictObject({
      ...defaultSchema.shape,
      ...providedSchema.shape,
    })

    let providedConfig = {}
    const providedConfigFile = await readConfigurationFile('config')

    if (!providedConfigFile) {
      logger.warn('No config file found')
    } else {
      providedConfig = providedConfigFile.default
    }

    this.#values = mergeWith(
      {},
      defaultConfig,
      providedConfig,
      overrideValues,
      arrayCustomizer,
    )

    this.validate(schema)
    this.#allowedKeys = extractOptions(schema)

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

  validate(schema): void {
    try {
      schema.parse(this.#values)
    } catch (e) {
      throw new ConfigSchemaError(e)
    }
  }
}

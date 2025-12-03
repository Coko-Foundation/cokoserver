import get from 'lodash/get'
import has from 'lodash/has'
import isEmpty from 'lodash/isEmpty'
import mergeWith from 'lodash/mergeWith'

import { findConfigurationFile } from '../utils/filesystem'
import defaultConfig from './defaultConfig'
import { ConfigSchema, ConfigType } from './configSchema'
import ConfigSchemaError from './ConfigSchemaError'
import logger from '../logger'

function arrayCustomizer(objValue: any, srcValue: any): any[] | undefined {
  if (Array.isArray(objValue) && Array.isArray(srcValue)) {
    return objValue.concat(srcValue)
  }

  return undefined
}

export default class Config {
  #values: ConfigType

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

    Object.freeze(this)
  }

  reset(): void {
    this.#values = defaultConfig
  }

  get values(): ConfigType {
    return Object.freeze(this.#values)
  }

  get(key: string): any {
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

/* eslint-disable no-undefined */

import get from 'lodash/get'
import has from 'lodash/has'
import isEmpty from 'lodash/isEmpty'
import mergeWith from 'lodash/mergeWith'

import { findConfigurationFile } from '../utils/filesystem'
import defaultConfig from './defaultConfig'
import { ConfigSchema, ConfigType } from './configSchema'

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
    const { default: loadBuilderConfig } = await import(
      '../cli/loadBuilderConfig'
    )
    const builderConfig = loadBuilderConfig()

    const configPath = findConfigurationFile('config', {
      basePath: builderConfig.configPath,
    })

    let providedConfig = {}

    if (configPath) {
      const { default: importedConfig } = await import(configPath)
      providedConfig = importedConfig
    }

    this.#values = mergeWith(
      defaultConfig,
      providedConfig,
      overrideValues,
      arrayCustomizer,
    )

    Object.freeze(this)
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
    ConfigSchema.parse(this.#values)
  }
}

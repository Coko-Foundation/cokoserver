class ConfigSchemaError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConfigSchemaError'
  }
}

class ConfigUnknownPropertyError extends Error {
  constructor(key: string) {
    super()
    this.name = 'ConfigUnknownPropertyError'
    this.message = `Key "${key}" is not defined in the config schema.`
  }
}

export { ConfigSchemaError, ConfigUnknownPropertyError }

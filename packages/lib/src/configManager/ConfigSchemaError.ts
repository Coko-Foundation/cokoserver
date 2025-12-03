class ConfigSchemaError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ConfigSchemaError'
  }
}

export default ConfigSchemaError

class ConfigSchemaError extends Error {
  constructor(message: string) {
    super(message)

    this.name = 'ConfigSchemaError'
    this.message = `${message}`
  }
}

export default ConfigSchemaError

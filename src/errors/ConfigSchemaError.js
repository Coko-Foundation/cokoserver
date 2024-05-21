class ConfigSchemaError extends Error {
  constructor(message) {
    super(message)

    this.name = 'ConfigSchemaError'
    this.message = `${message}`
  }
}

module.exports = ConfigSchemaError

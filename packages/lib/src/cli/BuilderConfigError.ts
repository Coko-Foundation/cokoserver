class BuilderConfigError extends Error {
  constructor(message: string) {
    super(message)

    this.name = 'BuilderConfigError'
    this.message = `${message}`
  }
}

export default BuilderConfigError

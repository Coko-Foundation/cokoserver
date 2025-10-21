export default class BuilderConfigError extends Error {
  constructor(message) {
    super(message)

    this.name = 'BuilderConfigError'
    this.message = `${message}`
  }
}

class JobManagerOptionsError extends Error {
  constructor(message) {
    super(message)

    this.name = 'JobManagerOptionsError'
    this.message = message
  }
}

module.exports = JobManagerOptionsError

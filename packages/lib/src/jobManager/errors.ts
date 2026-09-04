class JobManagerError extends Error {
  constructor(message: string) {
    super(message)

    this.name = 'JobManagerError'
    this.message = message
  }
}

class JobManagerOptionsError extends Error {
  constructor(message: string) {
    super(message)

    this.name = 'JobManagerOptionsError'
    this.message = message
  }
}

export { JobManagerError, JobManagerOptionsError }

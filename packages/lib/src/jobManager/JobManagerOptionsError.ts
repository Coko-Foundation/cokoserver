class JobManagerOptionsError extends Error {
  constructor(message: string) {
    super(message)

    this.name = 'JobManagerOptionsError'
    this.message = message
  }
}

export default JobManagerOptionsError

const { StatusCodes } = require('http-status-codes')

class ValidationError extends Error {
  constructor(message, status) {
    super(message)
    Error.captureStackTrace(this, 'ValidationError')
    this.name = 'ValidationError'
    this.message = message
    this.status = status || StatusCodes.CONFLICT
  }
}

module.exports = ValidationError

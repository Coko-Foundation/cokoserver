const { StatusCodes } = require('http-status-codes')

class NotFoundError extends Error {
  constructor(message, status) {
    super(message)
    Error.captureStackTrace(this, 'NotFoundError')
    this.name = 'NotFoundError'
    this.message = message || 'Not found'
    this.status = status || StatusCodes.NOT_FOUND
  }
}

module.exports = NotFoundError

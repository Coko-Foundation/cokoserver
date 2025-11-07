import { StatusCodes } from 'http-status-codes'

class ValidationError extends Error {
  status: string

  constructor(message, status?) {
    super(message)
    Error.captureStackTrace(this, 'ValidationError')
    this.name = 'ValidationError'
    this.message = message
    this.status = status || StatusCodes.CONFLICT
  }
}

export default ValidationError

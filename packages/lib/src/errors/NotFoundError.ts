import { StatusCodes } from 'http-status-codes'

class NotFoundError extends Error {
  status: number

  constructor(message: string, status?: number) {
    super(message)
    Error.captureStackTrace(this, NotFoundError)
    this.name = 'NotFoundError'
    this.message = message || 'Not found'
    this.status = status || StatusCodes.NOT_FOUND
  }
}

export default NotFoundError

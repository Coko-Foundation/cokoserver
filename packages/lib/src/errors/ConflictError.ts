import { StatusCodes } from 'http-status-codes'

class ConflictError extends Error {
  status: number

  constructor(message: string, status?: number) {
    super(message)
    Error.captureStackTrace(this, ConflictError)
    this.name = 'ConflictError'
    this.message = message
    this.status = status || StatusCodes.CONFLICT
  }
}

export default ConflictError

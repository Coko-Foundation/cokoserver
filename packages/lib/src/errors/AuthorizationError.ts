import { StatusCodes } from 'http-status-codes'

class AuthorizationError extends Error {
  constructor(message, status) {
    super(message)
    Error.captureStackTrace(this, 'AuthorizationError')
    this.name = 'AuthorizationError'
    this.message = message
    this.status = status || StatusCodes.FORBIDDEN
  }
}

export default AuthorizationError

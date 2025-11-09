import { StatusCodes } from 'http-status-codes'

class AuthenticationError extends Error {
  status: number

  constructor(message: string, status?: number) {
    super(message)
    Error.captureStackTrace(this, AuthenticationError)
    this.name = 'AuthenticationError'
    this.message = message
    this.status = status || StatusCodes.UNAUTHORIZED
  }
}

export default AuthenticationError

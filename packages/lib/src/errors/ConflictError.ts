import { StatusCodes } from 'http-status-codes'

import config from '../configManager/config'

class ConflictError extends Error {
  constructor(message, status) {
    super(message)
    Error.captureStackTrace(this, 'ConflictError')
    this.name = 'ConflictError'
    this.message = message
    this.status = status || StatusCodes.CONFLICT
  }
}

export default ConflictError

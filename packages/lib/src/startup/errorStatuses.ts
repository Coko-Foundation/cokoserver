import { Express, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import logger from '../logger'

interface HttpError extends Error {
  status?: number
}

const errorStatuses = (app: Express): void => {
  app.use((err: HttpError, _req: Request, res: Response): Response => {
    logger.error(err)

    if (err.name === 'ValidationError') {
      return res.status(StatusCodes.BAD_REQUEST).json({ message: err.message })
    }

    if (err.name === 'ConflictError') {
      return res.status(StatusCodes.CONFLICT).json({ message: err.message })
    }

    if (err.name === 'AuthorizationError') {
      return res.status(err.status).json({ message: err.message })
    }

    if (err.name === 'AuthenticationError') {
      return res.status(StatusCodes.UNAUTHORIZED).json({ message: err.message })
    }

    return res
      .status(err.status || StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: err.message })
  })
}

export default errorStatuses

const { StatusCodes } = require('http-status-codes')

const logger = require('../logger')

const errorStatuses = app => {
  app.use((err, req, res, next) => {
    // Development error handler, will print stacktrace
    if (app.get('env') === 'development' || app.get('env') === 'test') {
      logger.error(err)
      logger.error(err.stack)
    }

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

module.exports = errorStatuses

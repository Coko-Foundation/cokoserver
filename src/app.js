/* eslint-disable global-require, no-param-reassign */

const path = require('path')

const bodyParser = require('body-parser')
const config = require('config')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const express = require('express')
const helmet = require('helmet')
const STATUS = require('http-status-codes')
const morgan = require('morgan')
const passport = require('passport')
const wait = require('waait')

const logger = require('./logger')
const api = require('./routes/api')
const index = require('./routes/index')
const registerComponents = require('./registerComponents')
const healthcheck = require('./healthcheck')
const createCORSConfig = require('./corsConfig')
const { connectToFileStorage } = require('./services/fileStorage')

const configureApp = async app => {
  app.use(bodyParser.json({ limit: '50mb' }))

  morgan.token('graphql', ({ body }, res, type) => {
    if (!body.operationName) return ''

    switch (type) {
      case 'query':
        return body.query.replace(/\s+/g, ' ')
      case 'variables':
        return JSON.stringify(body.variables)
      case 'operation':
      default:
        return body.operationName
    }
  })

  app.use(
    morgan(config.get('pubsweet-server').morganLogFormat || 'combined', {
      stream: logger.stream,
    }),
  )

  app.use(bodyParser.urlencoded({ extended: false }))
  app.use(cookieParser())
  app.use(helmet())

  // Allow CORS from client if host / port is different
  const CORSConfig = createCORSConfig()
  app.use(cors(CORSConfig))

  app.use(express.static(path.resolve('.', '_build')))
  app.use(express.static(path.resolve('.', 'static')))

  if (config.has('pubsweet-server.uploads')) {
    app.use(
      '/uploads',
      express.static(path.resolve(config.get('pubsweet-server.uploads'))),
    )
  }

  // Register passport authentication strategies
  app.use(passport.initialize())
  const authentication = require('./authentication')

  passport.use('bearer', authentication.strategies.bearer)
  passport.use('anonymous', authentication.strategies.anonymous)
  passport.use('local', authentication.strategies.local)

  app.locals.passport = passport

  registerComponents(app)

  app.use('/api', api) // REST API

  app.get('/healthcheck', healthcheck) // Server health endpoint

  let useGraphQLServer = true

  if (
    config.has('pubsweet-server.useGraphQLServer') &&
    config.get('pubsweet-server.useGraphQLServer') === false
  ) {
    useGraphQLServer = false
  }

  if (useGraphQLServer) {
    const gqlApi = require('./graphqlApi')
    gqlApi(app) // GraphQL API
  }

  if (
    config.has('pubsweet-server.serveClient') &&
    config.get('pubsweet-server.serveClient')
  ) {
    app.use('/', index)
  }

  app.use((err, req, res, next) => {
    // Development error handler, will print stacktrace
    if (app.get('env') === 'development' || app.get('env') === 'test') {
      logger.error(err)
      logger.error(err.stack)
    }

    if (err.name === 'ValidationError') {
      return res.status(STATUS.BAD_REQUEST).json({ message: err.message })
    }

    if (err.name === 'ConflictError') {
      return res.status(STATUS.CONFLICT).json({ message: err.message })
    }

    if (err.name === 'AuthorizationError') {
      return res.status(err.status).json({ message: err.message })
    }

    if (err.name === 'AuthenticationError') {
      return res.status(STATUS.UNAUTHORIZED).json({ message: err.message })
    }

    return res
      .status(err.status || STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: err.message })
  })

  let useJobQueue = true

  if (
    config.has('pubsweet-server.useJobQueue') &&
    config.get('pubsweet-server.useJobQueue') === false
  ) {
    useJobQueue = false
  }

  if (
    config.has('pubsweet-server.useFileStorage') &&
    config.get('pubsweet-server.useFileStorage')
  ) {
    await connectToFileStorage()
  }

  // Actions to perform when the HTTP server starts listening
  app.onListen = async server => {
    if (useGraphQLServer) {
      const { addSubscriptions } = require('./graphql/subscriptions')
      addSubscriptions(server) // Add GraphQL subscriptions
    }

    if (useJobQueue) {
      const { startJobQueue, subscribeJobsToQueue } = require('./jobs')
      await startJobQueue() // Manage job queue
      await subscribeJobsToQueue() // Subscribe job callbacks to the queue
    }

    if (config.has('pubsweet-server.cron.path')) {
      /* eslint-disable-next-line import/no-dynamic-require */
      require(config.get('pubsweet-server.cron.path'))
    }
  }

  // Actions to perform when the server closes
  app.onClose = async () => {
    if (useJobQueue) {
      const { stopJobQueue } = require('./jobs')
      await stopJobQueue()
    }

    return wait(500)
  }

  return app
}

module.exports = configureApp

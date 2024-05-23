const express = require('express')
const { promisify } = require('util')
const http = require('http')
const config = require('config')
const passport = require('passport')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const morgan = require('morgan')

const logger = require('./logger')
const { logInit, logTask, logTaskItem } = require('./logger/internals')
const { migrate } = require('./dbManager/migrate')
const { startJobQueue, subscribeJobsToQueue, stopJobQueue } = require('./jobs')
const { connectToFileStorage } = require('./services/fileStorage')
const api = require('./routes/api')
const authentication = require('./authentication')
const healthcheck = require('./healthcheck')

const seedGlobalTeams = require('./startup/seedGlobalTeams')
const ensureTempFolderExists = require('./startup/ensureTempFolderExists')
const checkConfig = require('./startup/checkConfig')
const errorStatuses = require('./startup/errorStatuses')
const mountStatic = require('./startup/static')
const registerComponents = require('./startup/registerComponents')
const { cors } = require('./startup/cors')

const {
  runCustomStartupScripts,
  runCustomShutdownScripts,
} = require('./startup/customScripts')

let server
let useJobQueue = true
let useGraphQLServer = true

if (config.has('useJobQueue') && config.get('useJobQueue') === false) {
  useJobQueue = false
}

if (
  config.has('useGraphQLServer') &&
  config.get('useGraphQLServer') === false
) {
  useGraphQLServer = false
}

const startServer = async () => {
  if (server) return server

  const startTime = performance.now()

  logInit('Coko server init tasks')

  checkConfig()

  if (config.has('useFileStorage') && config.get('useFileStorage')) {
    await connectToFileStorage()
  }

  await ensureTempFolderExists()
  await migrate()
  await seedGlobalTeams()

  const app = express()

  await runCustomStartupScripts()

  const port = config.port || 3000
  app.set('port', port)
  const httpServer = http.createServer(app)
  httpServer.app = app

  logTask(`Starting HTTP server`)
  const startListening = promisify(httpServer.listen).bind(httpServer)
  await startListening(port)
  logTaskItem(`App is listening on port ${port}`)

  app.use(bodyParser.json({ limit: '50mb' }))
  app.use(bodyParser.urlencoded({ extended: false }))

  app.use(cookieParser())
  app.use(helmet())
  app.use(cors())

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
    morgan(
      (config.has('morganLogFormat') && config.get('morganLogFormat')) ||
        'combined',
      {
        stream: logger.stream,
      },
    ),
  )

  mountStatic(app)

  app.use(passport.initialize())

  passport.use('bearer', authentication.strategies.bearer)
  passport.use('anonymous', authentication.strategies.anonymous)
  passport.use('local', authentication.strategies.local)

  app.locals.passport = passport

  registerComponents(app)

  app.use('/api', api) // REST API

  app.get('/healthcheck', healthcheck) // Server health endpoint

  if (useGraphQLServer) {
    /* eslint-disable-next-line global-require */
    const gqlApi = require('./graphqlApi')
    gqlApi(app)
  }

  errorStatuses(app)

  if (useGraphQLServer) {
    /* eslint-disable-next-line global-require */
    const { addSubscriptions } = require('./graphql/subscriptions')
    addSubscriptions(httpServer)
  }

  if (useJobQueue) {
    await startJobQueue()
    await subscribeJobsToQueue()
  }

  if (config.has('cron.path')) {
    /* eslint-disable-next-line global-require, import/no-dynamic-require */
    require(config.get('cron.path'))
  }

  server = httpServer

  const endTime = performance.now()
  const durationInSeconds = (endTime - startTime) / 1000 // Convert to seconds
  logInit(
    `Coko server init finished in ${durationInSeconds.toFixed(4)} seconds`,
  )

  return httpServer
}

const shutdown = async signal => {
  logInit(`Coko server graceful shutdown after receiving signal ${signal}`)

  const startTime = performance.now()

  await runCustomShutdownScripts()

  logTask('Shut down http server')
  await server.close()
  logTaskItem('Http server successfully shut down')

  if (useJobQueue) {
    logTask('Shut down job queue')
    await stopJobQueue()
    logTaskItem('Successfully shut down job queue')
  }

  const endTime = performance.now()
  const durationInSeconds = (endTime - startTime) / 1000 // Convert to seconds
  logInit(
    `Coko server graceful shutdown finished in ${durationInSeconds.toFixed(
      4,
    )} seconds`,
  )

  process.exit()
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

module.exports = startServer

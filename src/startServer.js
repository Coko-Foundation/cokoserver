const express = require('express')
const { promisify } = require('util')
const http = require('http')
const config = require('config')
const passport = require('passport')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const morgan = require('morgan')

const logger = require('./logger')
const { logInit, logTask, logTaskItem } = require('./logger/internals')
const { migrate } = require('./dbManager/migrate')
const { startJobQueue, subscribeJobsToQueue, stopJobQueue } = require('./jobs')
const authentication = require('./authentication')
const healthcheck = require('./healthcheck')
const setupGraphqlServer = require('./graphql/setup')
const subscriptionManager = require('./graphql/pubsub')

const seedGlobalTeams = require('./startup/seedGlobalTeams')
const ensureTempFolderExists = require('./startup/ensureTempFolderExists')
const checkConfig = require('./startup/checkConfig')
const errorStatuses = require('./startup/errorStatuses')
const mountStatic = require('./startup/static')
const registerComponents = require('./startup/registerComponents')
const cors = require('./startup/cors')
const { checkConnections } = require('./startup/checkConnections')

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

  await ensureTempFolderExists()
  await checkConnections()
  await migrate()
  await seedGlobalTeams()
  await runCustomStartupScripts()

  const app = express()

  const port = config.port || 3000
  app.set('port', port)
  const httpServer = http.createServer(app)
  httpServer.app = app
  logTask(`Starting HTTP server`)
  const startListening = promisify(httpServer.listen).bind(httpServer)
  await startListening(port)
  logTaskItem(`App is listening on port ${port}`)

  app.use(express.json({ limit: '50mb' }))
  app.use(express.urlencoded({ extended: false }))
  app.use(cookieParser())
  app.use(helmet())
  app.use(cors)

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

  registerComponents(app)

  app.get('/healthcheck', healthcheck)

  if (useGraphQLServer) await setupGraphqlServer(httpServer, app, passport)

  errorStatuses(app)

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

  if (useGraphQLServer) {
    await subscriptionManager.client.end()
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

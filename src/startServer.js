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
const { db, migrationManager } = require('./db')
const { startJobManager, stopJobManager } = require('./jobManager')
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
let useGraphQLServer = true

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

  checkConfig(config)

  await ensureTempFolderExists()
  await checkConnections()
  await migrationManager.migrate()
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
  /**
   * Perhaps in the future, we can add a config option to make this 'same-site' in
   * some cases. (eg. client running at myapp.com and server running at
   * server.myapp.com can use a stricter 'same-site' policy without issues.)
   * Or maybe someone is not mounting static folders at all and they want to
   * restrict even further to 'same-origin'.
   */
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }))
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

  app.use(passport.initialize())
  passport.use('bearer', authentication.strategies.bearer)
  passport.use('anonymous', authentication.strategies.anonymous)
  passport.use('local', authentication.strategies.local)

  app.get('/healthcheck', healthcheck)

  mountStatic(app)
  registerComponents(app)
  errorStatuses(app)

  if (useGraphQLServer) await setupGraphqlServer(httpServer, app, passport)

  await startJobManager()

  server = httpServer

  const endTime = performance.now()
  const durationInSeconds = (endTime - startTime) / 1000 // Convert to seconds

  logInit(
    `Coko server init finished in ${durationInSeconds.toFixed(4)} seconds`,
  )

  return httpServer
}

const shutdownFn = async () => {
  await runCustomShutdownScripts()

  logTask('Shut down http server')
  await server.close()
  server = undefined
  logTaskItem('Http server successfully shut down')

  await stopJobManager({ destroy: true })

  if (useGraphQLServer) {
    logTask('Shut down subscription client')
    await subscriptionManager.client.end()
    logTaskItem('Subscription client successfully shut down')
  }

  logTask('Shut down database connection')
  await db.destroy()
  logTaskItem('Database connection successfully shut down')
}

const shutdown = async signal => {
  logInit(`Coko server graceful shutdown after receiving signal ${signal}`)
  const startTime = performance.now()

  await shutdownFn()

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

module.exports = { startServer, shutdownFn }

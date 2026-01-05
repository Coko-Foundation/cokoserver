import express from 'express'
import { promisify } from 'util'
import http from 'http'
import passport from 'passport'
import cookieParser from 'cookie-parser'
import helmet, { HelmetOptions } from 'helmet'
import * as Sentry from '@sentry/node'
// import morgan from 'morgan'

import internalLogger from './logger/internals'
import db from './db/db'
import subscriptionManager from './graphql/pubsub'
import healthcheck from './healthcheck'
import { ensureTempFolderExists } from './utils/filesystem'
import errorStatuses from './startup/errorStatuses'

import config from './configManager/config'
import { ConfigType } from './configManager/configSchema'
import fileStorage from './fileStorage'
import { initUrls } from './utils/urls'

let server: http.Server

/**
 * startServer is run with no parameters, but we allow a testConfig so that
 * tests can run the server in a specified setup.
 */
export const startServer = async (
  testConfig?: Partial<ConfigType>,
): Promise<http.Server> => {
  if (server) return server

  const startTime = performance.now()

  internalLogger.init('Coko server init tasks', { newLineBefore: true })

  internalLogger.section('Load config')
  await config.init(testConfig)
  internalLogger.success('Configuration valid!')

  internalLogger.section(`Ensure tmp folder exists`)
  await ensureTempFolderExists()
  internalLogger.success(`tmp folder now exists`)

  db.init()
  subscriptionManager.init()
  fileStorage.init()
  initUrls()
  const { checkConnections } = await import('./startup/checkConnections')
  await checkConnections()

  const { migrationManager } = await import('./db')
  await migrationManager.migrate()

  const { default: seedGlobalTeams } = await import('./startup/seedGlobalTeams')
  await seedGlobalTeams()

  const { runCustomStartupScripts } = await import('./startup/customScripts')
  await runCustomStartupScripts()

  const app = express()

  const port = config.get('port') || 3000
  app.set('port', port)
  const httpServer = http.createServer(app)
  // httpServer.app = app

  app.use(express.json({ limit: '50mb' }))
  app.use(express.urlencoded({ extended: false }))
  app.use(cookieParser())

  /**
   * Perhaps in the future, we can add a config option to make this 'same-site'
   * in some cases. (eg. client running at myapp.com and server running at
   * server.myapp.com can use a stricter 'same-site' policy without issues.)
   * Or maybe someone is not mounting static folders at all and they want to
   * restrict even further to 'same-origin'.
   */
  let helmetConfig: HelmetOptions = {
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }

  /**
   * This makes apollo explorer work in development
   * See https://docs.nestjs.com/security/helmet#use-with-express-default
   */
  if (
    process.env.NODE_ENV === 'development' &&
    config.get('useGraphQLServer')
  ) {
    helmetConfig = {
      ...helmetConfig,
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          imgSrc: [
            `'self'`,
            'data:',
            'apollo-server-landing-page.cdn.apollographql.com',
          ],
          scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
          manifestSrc: [
            `'self'`,
            'apollo-server-landing-page.cdn.apollographql.com',
          ],
          frameSrc: [`'self'`, 'sandbox.embed.apollographql.com'],
        },
      },
    }
  }

  app.use(helmet(helmetConfig))

  const { default: cors } = await import('./startup/cors')
  app.use(cors())

  // morgan.token('graphql', ({ body }, _res, type) => {
  //   if (!body.operationName) return ''

  //   switch (type) {
  //     case 'query':
  //       return body.query.replace(/\s+/g, ' ')
  //     case 'variables':
  //       return JSON.stringify(body.variables)
  //     case 'operation':
  //     default:
  //       return body.operationName
  //   }
  // })

  // app.use(
  //   morgan('combined', {
  //     stream: logger.stream,
  //   }),
  // )

  const { default: authentication } = await import('./authentication')
  // @ts-ignore
  app.use(passport.initialize())
  passport.use('bearer', authentication.strategies.bearer)
  passport.use('anonymous', authentication.strategies.anonymous)
  passport.use('local', authentication.strategies.local)

  app.get('/healthcheck', healthcheck)

  const { default: mountStatic } = await import('./startup/static')
  mountStatic(app)

  const { default: registerComponents } =
    await import('./startup/registerComponents')
  await registerComponents(app)

  if (config.get('useGraphQLServer')) {
    const { default: setupGraphqlServer } = await import('./graphql/setup')
    await setupGraphqlServer(httpServer, app, passport)
  }

  const { jobManager } = await import('./jobManager')
  await jobManager.init()

  internalLogger.section(`Starting HTTP server`)

  const sentryDsn = config.get('sentry.dsn')

  if (sentryDsn) {
    Sentry.setupExpressErrorHandler(app)
    internalLogger.success('Sentry initialized')
  } else {
    internalLogger.warn(
      'Skipping sentry initialization: no dsn key found in config',
    )
  }

  errorStatuses(app)

  const startListening = promisify(httpServer.listen).bind(httpServer)
  await startListening(port)
  internalLogger.point(`App is listening on port ${port}`)

  server = httpServer

  const endTime = performance.now()
  const durationInSeconds = (endTime - startTime) / 1000 // Convert to seconds

  internalLogger.init(
    `Coko server init finished in ${durationInSeconds.toFixed(4)} seconds`,
    {
      newLineBefore: true,
      newLineAfter: true,
    },
  )

  return server
}

export const shutdownFn = async (): Promise<void> => {
  const { runCustomShutdownScripts } = await import('./startup/customScripts')
  await runCustomShutdownScripts()

  internalLogger.section('Shut down http server')
  server.close()
  server = undefined
  internalLogger.success('Http server successfully shut down')

  const { jobManager } = await import('./jobManager')
  await jobManager.stop({ destroy: true })

  if (config.get('useGraphQLServer')) {
    internalLogger.section('Shut down subscription client')
    await subscriptionManager.client.end()
    internalLogger.success('Subscription client successfully shut down')
  }

  internalLogger.section('Shut down database connection')
  await db.destroy()

  internalLogger.success('Database connection successfully shut down')
}

const shutdown = async (signal: string): Promise<void> => {
  internalLogger.init(
    `Coko server graceful shutdown after receiving signal ${signal}`,
  )
  const startTime = performance.now()

  await shutdownFn()

  const endTime = performance.now()
  const durationInSeconds = (endTime - startTime) / 1000 // Convert to seconds
  internalLogger.init(
    `Coko server graceful shutdown finished in ${durationInSeconds.toFixed(
      4,
    )} seconds`,
  )

  process.exit()
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

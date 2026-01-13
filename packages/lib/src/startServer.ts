import express from 'express'
import { promisify } from 'util'
import http from 'http'
import passport from 'passport'
import cookieParser from 'cookie-parser'
import helmet, { HelmetOptions } from 'helmet'
import * as Sentry from '@sentry/node'
import httpLogger from 'pino-http'

import internalLogger from './logger/internals'
import { db, migrationManager } from './db'
import subscriptionManager from './graphql/pubsub'
import healthcheck from './healthcheck'
import { ensureTempFolderExists } from './utils/filesystem'
import errorStatuses from './startup/errorStatuses'
import config from './configManager/config'
import { ConfigType } from './configManager/configSchema'
import fileStorage from './fileStorage'
import { initUrls } from './utils/urls'
import { checkConnections } from './startup/checkConnections'
import seedGlobalTeams from './startup/seedGlobalTeams'
import {
  runCustomStartupScripts,
  runCustomShutdownScripts,
} from './startup/customScripts'
import cors from './startup/cors'
import authentication from './authentication'
import mountStatic from './startup/static'
import registerComponents from './startup/registerComponents'
import setupGraphqlServer from './graphql/setup'
import { jobManager } from './jobManager'
import { env } from './utils/env'

let server: http.Server

const nodeEnv = env('NODE_ENV')
const isDevelopment = nodeEnv === 'development'

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
  await checkConnections()

  await migrationManager.migrate()

  await seedGlobalTeams()

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
  if (isDevelopment && config.get('useGraphQLServer')) {
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
  app.use(cors())

  app.use(
    httpLogger({
      transport: isDevelopment
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              messageFormat:
                '{req.method} {req.url} {res.statusCode} - {responseTime}ms - request ID: {req.id}',
              ignore: 'req,res,err,responseTime',
            },
          }
        : undefined,
      customProps: (req, _res) => {
        if (!(req.url === '/graphql' && req.body)) return {}
        const { variables, operationName } = req.body

        return {
          gql: {
            operation: operationName || 'unnamed',
            // Do not log variables in production due to PII/GDPR etc.
            // Maybe at some point we could have a whitelist for variables that are explictly OK to log
            variables: isDevelopment ? variables : undefined,
          },
        }
      },
      redact: {
        paths: [
          'req.headers.cookie',
          'req.headers.authorization',
          'gql.variables.token',
          'gql.variables.email',
          'gql.variables.password',
          'gql.variables.currentPassword',
          'gql.variables.newPassword',
          'gql.variables.input.token',
          'gql.variables.input.email',
          'gql.variables.input.password',
          'gql.variables.input.currentPassword',
          'gql.variables.input.newPassword',
        ],
        censor: '*****',
      },
    }),
  )

  // @ts-ignore
  app.use(passport.initialize())
  passport.use('bearer', authentication.strategies.bearer)
  passport.use('anonymous', authentication.strategies.anonymous)
  passport.use('local', authentication.strategies.local)

  app.get('/healthcheck', healthcheck)

  mountStatic(app)

  await registerComponents(app)

  if (config.get('useGraphQLServer')) {
    await setupGraphqlServer(httpServer, app, passport)
  }

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
  await runCustomShutdownScripts()

  internalLogger.section('Shut down http server')
  server.close()
  server = undefined
  internalLogger.success('Http server successfully shut down')

  await jobManager.stop()

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

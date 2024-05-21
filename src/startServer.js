const express = require('express')
const { promisify } = require('util')
const http = require('http')
const config = require('config')
const fs = require('fs')
const path = require('path')
const isFunction = require('lodash/isFunction')

const logger = require('./logger')
const { logInit } = require('./logger/internals')
const { migrate } = require('./dbManager/migrate')

const seedGlobalTeams = require('./startup/seedGlobalTeams')
const ensureTempFolderExists = require('./startup/ensureTempFolderExists')
const { runCustomStartupScripts } = require('./startup/customScripts')

let server

const startServer = async (app = express()) => {
  if (server) return server

  const startTime = performance.now()

  logInit('Coko server init tasks')

  await ensureTempFolderExists()
  await migrate()
  await seedGlobalTeams()

  let configureApp
  // ./server/app.js in your app is used if it exist,
  // and no different entrypoint is configured in the
  // config at `app`
  const appPath = path.resolve('.', 'server', 'app.js')

  if (config.has('app')) {
    // See if a custom app entrypoint is configured

    try {
      /* eslint-disable-next-line global-require, import/no-dynamic-require */
      configureApp = require(config.get('app'))
    } catch (e) {
      logger.error(e)
      throw new Error('Cannot load app from provided path!')
    }
  } else if (fs.existsSync(appPath)) {
    // See if a custom app entrypoint exists at ./server/app.js
    /* eslint-disable-next-line global-require, import/no-dynamic-require */
    configureApp = require(appPath)
  } else {
    // If no custom entrypoints exist, use the default
    /* eslint-disable-next-line global-require */
    configureApp = require('./app')
  }

  if (!configureApp) {
    throw new Error('App module not found!')
  }

  if (!isFunction(configureApp)) {
    throw new Error('App module is not a function!')
  }

  const configuredApp = await configureApp(app)

  await runCustomStartupScripts()

  const port = config.port || 3000
  configuredApp.set('port', port)
  const httpServer = http.createServer(configuredApp)
  httpServer.app = configuredApp

  logger.info(`Starting HTTP server`)
  const startListening = promisify(httpServer.listen).bind(httpServer)
  await startListening(port)
  logger.info(`App is listening on port ${port}`)
  await configuredApp.onListen(httpServer)

  httpServer.originalClose = httpServer.close

  httpServer.close = async cb => {
    server = undefined
    await configuredApp.onClose()
    return httpServer.originalClose(cb)
  }

  server = httpServer

  const endTime = performance.now()
  const durationInSeconds = (endTime - startTime) / 1000 // Convert to seconds
  logInit(
    `Coko server init finished in ${durationInSeconds.toFixed(4)} seconds`,
  )

  return httpServer
}

module.exports = startServer

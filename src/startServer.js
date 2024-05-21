const express = require('express')
const { promisify } = require('util')
const http = require('http')
const config = require('config')

const logger = require('./logger')
const { logInit } = require('./logger/internals')
const { migrate } = require('./dbManager/migrate')
const configureApp = require('./app')

const seedGlobalTeams = require('./startup/seedGlobalTeams')
const ensureTempFolderExists = require('./startup/ensureTempFolderExists')
const { runCustomStartupScripts } = require('./startup/customScripts')
const checkConfig = require('./startup/checkConfig')

let server

const startServer = async () => {
  if (server) return server

  const startTime = performance.now()

  logInit('Coko server init tasks')

  checkConfig()
  await ensureTempFolderExists()
  await migrate()
  await seedGlobalTeams()

  const app = express()
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

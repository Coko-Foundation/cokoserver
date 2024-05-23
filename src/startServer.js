const express = require('express')
const { promisify } = require('util')
const http = require('http')
const config = require('config')

const { logInit, logTask, logTaskItem } = require('./logger/internals')
const { migrate } = require('./dbManager/migrate')
const configureApp = require('./app')
const { stopJobQueue } = require('./jobs')

const seedGlobalTeams = require('./startup/seedGlobalTeams')
const ensureTempFolderExists = require('./startup/ensureTempFolderExists')
const checkConfig = require('./startup/checkConfig')

const {
  runCustomStartupScripts,
  runCustomShutdownScripts,
} = require('./startup/customScripts')

let server
let useJobQueue = true

if (config.has('useJobQueue') && config.get('useJobQueue') === false) {
  useJobQueue = false
}

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

  logTask(`Starting HTTP server`)
  const startListening = promisify(httpServer.listen).bind(httpServer)
  await startListening(port)
  logTaskItem(`App is listening on port ${port}`)

  await configuredApp.onListen(httpServer)

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

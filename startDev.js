/* eslint-disable class-methods-use-this, import/no-extraneous-dependencies, n/no-process-exit */

const { spawn } = require('child_process')
const fs = require('fs')
const chalk = require('chalk')

/* eslint-disable no-console */
class Logger {
  info(str) {
    console.log(chalk.hex('#D2691E')('[tsc]'), str)
  }

  error(str) {
    console.log(chalk.red('[tsc]'), str)
  }
}
/* eslint-enable no-console */

const logger = new Logger()
let hasBuiltOnce = false
let outputBuffer = ''

logger.info('Starting TypeScript Compiler in watch mode...')

// Spawn the tsc process
const tscProcess = spawn('yarn workspace @coko/server tsc', ['--watch'], {
  shell: true,
})

tscProcess.stdout.on('data', data => {
  outputBuffer += data.toString()
  const lines = outputBuffer.split('\n')
  outputBuffer = lines.pop()

  lines.forEach(line => {
    logger.info(line)

    if (line.includes('Watching for file changes')) {
      spawn('yarn workspace @coko/server copy-assets', {
        shell: true,
        stdio: 'inherit',
      })

      if (!hasBuiltOnce) {
        hasBuiltOnce = true
        spawn('yarn workspace dev coko-server start-dev', {
          shell: true,
          stdio: 'inherit',
        })
      } else {
        const randomString = Math.random().toString(36).slice(2)
        fs.writeFileSync('./packages/dev/restartTrigger.txt', randomString)
      }
    }
  })
})

// tscProcess.on('close', code => {})

tscProcess.on('error', err => {
  logger.error(`\nFailed to start tsc process: ${err.message}`)
})

process.on('SIGINT', () => {
  logger.error('Killing tsc process...')
  tscProcess.kill()
  process.exit()
})

#!/usr/bin/env node

const path = require('path')

const { program } = require('commander')
const madge = require('madge')
const output = require('madge/lib/output')
const ora = require('ora')
const nodemon = require('nodemon')

const pkg = require('../../package.json')
const logger = require('../logger')
const { logNodemon } = require('../logger/internals')
const { migrationManager } = require('../db')
const startServer = require('../startServer')

program
  .command('start')
  .description('Start server')
  .showHelpAfterError()
  .action(() => {
    startServer()
  })

program
  .command('start-dev')
  .description('Start development server')
  .showHelpAfterError()
  .action(() => {
    const scriptPath = path.join(__dirname, '..', 'init')

    nodemon({
      script: scriptPath,
      ignore: './tmp/*',
    })

    nodemon
      .on('start', () => {
        logNodemon('\nStarting dev server...')
      })
      .on('quit', () => {
        logNodemon('\nStopping dev server...\n')
        process.exit()
      })
      .on('restart', files => {
        logNodemon(`Retarting dev server due to files ${files}...`, {
          withLines: true,
        })
      })
  })

const migrateCommand = program
  .command('migrate')
  .description('Run or roll back migrations')
  .showHelpAfterError()

migrateCommand
  .command('up')
  .option('-s, --step <number>', 'How many migrations to run')
  .option(
    '-l, --skip-last <number>',
    'Run all except for the last <number> migrations. If used, the --step option is discarded.',
  )
  .description('Run migrations')
  .alias('run')
  .action(async options => {
    try {
      const optionsToPass = {}

      if (options.skipLast) {
        optionsToPass.skipLast = parseInt(options.skipLast, 10)
      }

      if (options.step) {
        optionsToPass.step = parseInt(options.step, 10)
      }

      await migrationManager.migrate(optionsToPass)
      process.exit(0)
    } catch (e) {
      logger.error(e)
      process.exit(1)
    }
  })

migrateCommand
  .command('down')
  .option('-s, --step <number>', 'How many migrations to roll back', 1)
  .option(
    '-l, --last-successful-run',
    'Roll back to the last time migrate completed successfully. If used, the --step option is discarded.',
  )
  .description('Roll back migrations')
  .alias('rollback')
  .action(async options => {
    const optionsToPass = {}
    const lastSuccessfulRun = options.lastSuccessfulRun === true
    const step = parseInt(options.step, 10)

    if (!lastSuccessfulRun) {
      if (step > 1) optionsToPass.step = step
    } else {
      optionsToPass.lastSuccessfulRun = true
    }

    try {
      await migrationManager.rollback(optionsToPass)
      process.exit(0)
    } catch (e) {
      logger.error(e)
      process.exit(1)
    }
  })

migrateCommand
  .command('pending')
  .description('Display pending migrations')
  .action(async () => {
    try {
      await migrationManager.pending()
      process.exit(0)
    } catch (e) {
      logger.error(e)
      process.exit(1)
    }
  })

migrateCommand
  .command('executed')
  .description('Display executed migrations')
  .action(async () => {
    try {
      await migrationManager.executed()
      process.exit(0)
    } catch (e) {
      logger.error(e)
      process.exit(1)
    }
  })

program
  .command('circular')
  .description('Display circular dependencies')
  .showHelpAfterError()
  .action(async () => {
    const res = await madge(process.cwd())
    const circular = res.circular()

    // borrowed from the madge cli tool: https://github.com/pahen/madge/blob/master/bin/cli.js#L9
    const spinner = ora({
      text: 'Finding files',
      color: 'white',
      interval: 100000,
      isEnabled: program.spinner === 'false' ? false : null,
    })

    output.circular(spinner, res, circular, {
      json: program.json,
      printCount: program.count,
    })
  })

program
  .name('coko-server')
  .version(pkg.version, '-v, --version')
  .description("Coko server's cli tool")
  .showHelpAfterError()
  .parse(process.argv)

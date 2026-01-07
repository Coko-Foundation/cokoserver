import path from 'path'
import { execSync } from 'child_process'

import { program } from 'commander'
import madge from 'madge'
import output from 'madge/lib/output'
import ora from 'ora'
import nodemon from 'nodemon'

import logger from '../logger'
import internalLogger from '../logger/internals'
import loadBuilderConfig from './loadBuilderConfig'
import generateTsConfig from './generateTsConfig'
import { MigrateOptions, RollbackOptions } from '../db/migrate'
import { db, migrationManager } from '../db'
import config from '../configManager/config'

const pkg = require('../../package.json')

const outDir = path.join(process.cwd(), 'dist')

const tscPath = path.dirname(require.resolve('typescript'))
const tsc = path.join(tscPath, '..', 'bin', 'tsc')

const tsxPath = path.dirname(require.resolve('tsx'))
const tsx = path.join(tsxPath, 'cli.mjs')

program
  .command('build')
  .description('Build production server')
  .showHelpAfterError()
  .action(() => {
    logger.info('🛠  Building TypeScript...')

    const tsConfig = generateTsConfig()

    const command = `
      echo ${tsConfig} |
      ${tsc} --project /dev/stdin --outDir ${outDir}
    `.trim()

    execSync(command, { stdio: 'inherit' })

    logger.info('✅ Build completed successfully.')
  })

program
  .command('start')
  .description('Start server')
  .showHelpAfterError()
  .action(async () => {
    const serverPath = path.join(outDir, 'startServer.js')
    const { startServer } = await import(serverPath)
    startServer()
  })

program
  .command('start-dev')
  .description('Start development server')
  .showHelpAfterError()
  .action(async () => {
    const {
      devServer: { inspectorPort, ignore },
    } = loadBuilderConfig()

    const tsConfig = generateTsConfig()
    const scriptPath = path.join(__dirname, '..', 'init.js')

    const exec = `
      echo ${tsConfig} |
      ${tsx} --inspect=0.0.0.0:${inspectorPort} --tsconfig /dev/stdin
    `.trim()

    nodemon({
      script: scriptPath,
      exec,
      ignore,
      ext: '*',
    })

    nodemon
      .on('start', () => {
        internalLogger.nodemon('Starting dev server...')
      })
      .on('quit', () => {
        internalLogger.nodemon('Stopping dev server...')
        process.exit()
      })
      .on('restart', files => {
        internalLogger.nodemon(`Retarting dev server due to files ${files}...`)
      })
  })

const migrateCommand = program
  .command('migrate')
  .description('Run or roll back migrations')
  .hook('preAction', async () => {
    const tsConfig = generateTsConfig()

    const { register } = await import('ts-node')

    register({
      transpileOnly: true,
      compilerOptions: tsConfig.compilerOptions,
    })

    await config.init()
    db.init()
  })
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
      const optionsToPass: Partial<MigrateOptions> = {}

      if (options.skipLast) {
        optionsToPass.skipLast = parseInt(options.skipLast, 10)
      }

      if (options.step) {
        optionsToPass.step = parseInt(options.step, 10)
      }

      await migrationManager.migrate(optionsToPass as MigrateOptions)
      process.exit(0)
    } catch (e) {
      logger.error(e)
      process.exit(1)
    }
  })

migrateCommand
  .command('down')
  .option('-s, --step <number>', 'How many migrations to roll back', '1')
  .option(
    '-l, --last-successful-run',
    'Roll back to the last time migrate completed successfully. If used, the --step option is discarded.',
  )
  .description('Roll back migrations')
  .alias('rollback')
  .action(async options => {
    const optionsToPass: Partial<RollbackOptions> = {}
    const lastSuccessfulRun = options.lastSuccessfulRun === true
    const step = parseInt(options.step, 10)

    if (!lastSuccessfulRun) {
      if (step > 1) optionsToPass.step = step
    } else {
      optionsToPass.lastSuccessfulRun = true
    }

    try {
      await migrationManager.rollback(optionsToPass as RollbackOptions)
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
    try {
      const res = await madge(process.cwd())
      const circular = res.circular()

      // borrowed from the madge cli tool: https://github.com/pahen/madge/blob/master/bin/cli.js#L9
      const spinner = ora({
        text: 'Finding files',
        color: 'white',
        interval: 100000,
        // @ts-ignore
        isEnabled: program.spinner === 'false' ? false : null,
      })

      output.circular(spinner, res, circular, {
        // @ts-ignore
        json: program.json,
        // @ts-ignore
        printCount: program.count,
      })

      process.exit(0)
    } catch (e) {
      logger.error(e)
      process.exit(1)
    }
  })

program
  .name('coko-server')
  .version(pkg.version, '-v, --version')
  .description("Coko server's cli tool")
  .showHelpAfterError()
  .parse(process.argv)

#!/usr/bin/env node

/* eslint-disable import/extensions */

import path from 'path'
import { execSync } from 'child_process'

import { program } from 'commander'
import madge from 'madge'
import output from 'madge/lib/output.js'
import ora from 'ora'
import nodemon from 'nodemon'

import logger from '../logger/index.js'
import { logNodemon } from '../logger/internals.js'
import loadBuilderConfig from './loadBuilderConfig.mjs'
import generateTsConfig from './generateTsConfig.mjs'

const { default: pkg } = await import('../../package.json', {
  with: { type: 'json' },
})

async function ensureTsSupport() {
  const { buildPath } = loadBuilderConfig()
  const tsConfigPath = generateTsConfig(buildPath)

  const { register } = await import('ts-node')

  register({
    transpileOnly: true,
    project: tsConfigPath,
  })
}

const outDir = path.join(process.cwd(), 'dist')

program
  .command('build')
  .description('Build production server')
  .showHelpAfterError()
  .action(() => {
    logger.info('🛠  Building TypeScript...')

    const { buildPath } = loadBuilderConfig()
    const tsConfigPath = generateTsConfig(buildPath)

    execSync(`tsc --project ${tsConfigPath} --outDir ${outDir}`, {
      stdio: 'inherit',
    })

    logger.info('✅ Build completed successfully.')
  })

program
  .command('start')
  .description('Start server')
  .showHelpAfterError()
  .action(async () => {
    const serverPath = path.join(outDir, 'src', 'startServer.js')
    const { startServer } = await import(serverPath)
    startServer()
  })

program
  .command('start-dev')
  .description('Start development server')
  .showHelpAfterError()
  .action(() => {
    const {
      buildPath,
      devServer: { inspectorPort, ignore },
    } = loadBuilderConfig()

    const tsConfigPath = generateTsConfig(buildPath)
    const scriptPath = path.join(import.meta.dirname, '..', 'init.js')

    const nodeOptions = `NODE_OPTIONS="--inspect=0.0.0.0:${inspectorPort}"`
    const configOption = `--project ${tsConfigPath}`
    const exec = `${nodeOptions} ts-node ${configOption} ${scriptPath}`

    nodemon({
      exec,
      ignore,
      ext: '*',
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
  .hook('preAction', async () => {
    /**
     * We want to register ts-node and import migration manager on the fly, to
     * make sure that typescript code will work without a pre-compile step.
     */
    await ensureTsSupport()
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
    const { migrationManager } = await import('../db/index.js')

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
    const { migrationManager } = await import('../db/index.js')

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
    const { migrationManager } = await import('../db/index.js')

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
    const { migrationManager } = await import('../db/index.js')

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
        isEnabled: program.spinner === 'false' ? false : null,
      })

      output.circular(spinner, res, circular, {
        json: program.json,
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

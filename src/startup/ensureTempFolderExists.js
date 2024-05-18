const fs = require('fs-extra')
const chalk = require('chalk')

const logger = require('../logger')
const tempFolderPath = require('../utils/tempFolderPath')

const ensureTempFolderExists = async () => {
  logger.info(`\n${chalk.cyan('Task:')} Ensure tmp folder exists\n`)

  await fs.ensureDir(tempFolderPath)
  logger.info(`${chalk.cyan('\u25cf')} tmp folder now exists`)
}

module.exports = ensureTempFolderExists

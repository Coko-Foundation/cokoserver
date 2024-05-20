const chalk = require('chalk')

const logger = require('./index')

const BULLET = '\u25cf'
// const CHECK = '\u2713'
const CHECK_BG = '\u2705'
const CROSS = '\u2718'
const HORIZONTAL_BOX = '\u2500'
const PICKAXE = '\u26CF'

const SEPARATOR = `\n${HORIZONTAL_BOX.repeat(65)}\n\n`

const logErrorTask = str => {
  logger.error(`${chalk.red(CROSS)} ${str}`)
}

const logInit = str => {
  logger.info(chalk.yellow(`\n${PICKAXE}  ${str}  ${PICKAXE}`))
}

const logSuccess = str => {
  logger.info(chalk.green(str))
}

const logSuccessTask = str => {
  logger.info(
    `${chalk.cyan(BULLET)} ${chalk.green(str)} ${chalk.green(CHECK_BG)}`,
  )
}

const logTask = str => {
  logger.info(`${SEPARATOR}${chalk.cyan('Task:')} ${str}\n`)
}

const logTaskItem = str => {
  logger.info(`${chalk.cyan(BULLET)} ${str}`)
}

module.exports = {
  logErrorTask,
  logInit,
  logSuccess,
  logSuccessTask,
  logTask,
  logTaskItem,
}

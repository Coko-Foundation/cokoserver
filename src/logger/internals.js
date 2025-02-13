const chalk = require('chalk')

const logger = require('./index')

const BULLET = '\u25cf'
const CHECK = '\u2713'
// const CHECK_BG = '\u2705'
const CROSS = '\u2718'
const HORIZONTAL_BOX = '\u2500'
const PICKAXE = '\u26CF'

const SEPARATOR = `${HORIZONTAL_BOX.repeat(80)}`

const logErrorTask = str => {
  logger.error(`${chalk.red(CROSS)} ${str}`)
}

const logInit = str => {
  logger.info(chalk.yellow(`\n${PICKAXE}   ${str}  ${PICKAXE}`))
}

const logNodemon = (str, options = { withLines: false }) => {
  const { withLines } = options

  logger.info(
    chalk.yellow(
      `${withLines ? `\n${SEPARATOR}\n\n` : ''}${str}${
        withLines ? `\n\n${SEPARATOR}` : ''
      }`,
    ),
  )
}

const logReport = (header, str) => {
  logger.info(`${chalk.magenta(header)} ${str}`)
}

const logSuccess = str => {
  logger.info(chalk.green(str))
}

const logSuccessTask = str => {
  logger.info(`${chalk.cyan(BULLET)} ${chalk.green(str)} ${chalk.green(CHECK)}`)
}

const logTask = str => {
  logger.info(`\n${SEPARATOR}\n\n${chalk.cyan('Task:')} ${str}\n`)
}

const logTaskItem = str => {
  logger.info(`${chalk.cyan(BULLET)} ${str}`)
}

const logTaskSubItem = str => {
  logger.info(`  ${chalk.cyan(CHECK)} ${str}`)
}

module.exports = {
  logErrorTask,
  logInit,
  logNodemon,
  logReport,
  logSuccess,
  logSuccessTask,
  logTask,
  logTaskItem,
  logTaskSubItem,
}

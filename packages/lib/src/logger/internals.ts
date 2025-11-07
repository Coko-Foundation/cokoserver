import chalk from 'chalk'

import logger from './index'

const BULLET = '\u25cf'
const CHECK = '\u2713'
// const CHECK_BG = '\u2705'
const CROSS = '\u2718'
const HORIZONTAL_BOX = '\u2500'
const PICKAXE = '\u26CF'

const SEPARATOR = `${HORIZONTAL_BOX.repeat(80)}`

const logErrorTask = (str: string): void => {
  logger.error(`${chalk.red(CROSS)} ${str}`)
}

const logInit = (str: string): void => {
  logger.info(chalk.yellow(`\n${PICKAXE}   ${str}  ${PICKAXE}`))
}

type LogNodemonOptions = {
  withLines: boolean
}

const logNodemon = (
  str: string,
  options: LogNodemonOptions = { withLines: false },
): void => {
  const { withLines } = options

  logger.info(
    chalk.yellow(
      `${withLines ? `\n${SEPARATOR}\n\n` : ''}${str}${
        withLines ? `\n\n${SEPARATOR}` : ''
      }`,
    ),
  )
}

const logReport = (header: string, str: string): void => {
  logger.info(`${chalk.magenta(header)} ${str}`)
}

const logSuccess = (str: string): void => {
  logger.info(chalk.green(str))
}

const logSuccessTask = (str: string): void => {
  logger.info(`${chalk.cyan(BULLET)} ${chalk.green(str)} ${chalk.green(CHECK)}`)
}

const logTask = (str: string): void => {
  logger.info(`\n${SEPARATOR}\n\n${chalk.cyan('Task:')} ${str}\n`)
}

const logTaskItem = (str: string): void => {
  logger.info(`${chalk.cyan(BULLET)} ${str}`)
}

const logTaskSubItem = (str: string): void => {
  logger.info(`  ${chalk.cyan(CHECK)} ${str}`)
}

export {
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

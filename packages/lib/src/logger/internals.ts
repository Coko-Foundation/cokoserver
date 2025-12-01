/* eslint-disable no-console, class-methods-use-this */

import chalk from 'chalk'

import logger from './index'

const BULLET = '\u25cf'
const CHECK = '\u2713'
const COG = '\u2699'
const CROSS = '\u2718'
const HOURGLASS = '\u23F3'
const PICKAXE = '\u26CF'

type NewLineOptions = {
  newLineBefore?: boolean
  newLineAfter?: boolean
}

const logReport = (header: string, str: string): void => {
  logger.info(`${chalk.magenta(header)} ${str}`)
}

class InternalLogger {
  primary = chalk.hex('#4169E1')

  error(str: string): void {
    logger.error(`${chalk.red(CROSS)} ${str}`)
  }

  init(str: string, options: NewLineOptions = {}): void {
    logger.info(
      chalk.yellow(
        `${options.newLineBefore ? '\n' : ''}${PICKAXE}   ${str}  ${PICKAXE}${options.newLineAfter ? '\n' : ''}`,
      ),
    )
  }

  nodemon(str: string, options: NewLineOptions = {}): void {
    console.log(
      chalk.yellow(
        `${options.newLineBefore ? '\n' : ''}${COG}  [nodemon] ${str}${options.newLineAfter ? '\n' : ''}`,
      ),
    )
  }

  point(str: string, indent: number = 0): void {
    logger.info(`${' '.repeat(indent)}${this.primary(BULLET)} ${str}`)
  }

  section(str: string): void {
    logger.info(`\n${this.primary.bold.underline(`${str}`)}`)
  }

  success(str: string, indent: number = 0): void {
    logger.info(`${' '.repeat(indent)}${chalk.green(CHECK)} ${str}`)
  }

  wait(str: string): void {
    logger.info(`${HOURGLASS} ${str}`)
  }

  warn(str: string): void {
    logger.info(`${chalk.yellow(BULLET)} ${str}`)
  }
}

const internalLogger = new InternalLogger()
export default internalLogger

export { logReport }

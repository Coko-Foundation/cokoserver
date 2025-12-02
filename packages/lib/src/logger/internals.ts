/* eslint-disable no-console, class-methods-use-this */

import chalk from 'chalk'

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

class InternalLogger {
  primary = chalk.hex('#4169E1')

  error(str: string): void {
    console.log(`${chalk.red(CROSS)} ${str}`)
  }

  init(str: string, options: NewLineOptions = {}): void {
    console.log(
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
    console.log(`${' '.repeat(indent)}${this.primary(BULLET)} ${str}`)
  }

  report(header: string, str: string): void {
    console.log(`${chalk.magenta(header)} ${str}`)
  }

  section(str: string): void {
    console.log(`\n${this.primary.bold.underline(`${str}`)}`)
  }

  success(str: string, indent: number = 0): void {
    console.log(`${' '.repeat(indent)}${chalk.green(CHECK)} ${str}`)
  }

  wait(str: string): void {
    console.log(`${HOURGLASS} ${str}`)
  }

  warn(str: string): void {
    console.log(`${chalk.yellow(BULLET)} ${str}`)
  }
}

const internalLogger = new InternalLogger()
export default internalLogger

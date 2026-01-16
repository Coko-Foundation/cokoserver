/* eslint-disable no-console, class-methods-use-this */

import chalk from 'chalk'

import { env } from '../utils/env'

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

const isTest = process.env.NODE_ENV === 'test'
const suppress =
  isTest && env('SUPPRESS_LOGGER_IN_TEST_ENV', { type: 'boolean' })

class InternalLogger {
  primary = chalk.hex('#4169E1')

  builder(str: string, options: NewLineOptions = {}): void {
    if (suppress) return

    console.log(
      chalk.yellow(
        `${options.newLineBefore ? '\n' : ''}${COG}  [builder] ${str}${options.newLineAfter ? '\n' : ''}`,
      ),
    )
  }

  error(str: string): void {
    if (suppress) return
    console.log(`${chalk.red(CROSS)} ${str}`)
  }

  init(str: string, options: NewLineOptions = {}): void {
    if (suppress) return

    console.log(
      chalk.yellow(
        `${options.newLineBefore ? '\n' : ''}${PICKAXE}   ${str}  ${PICKAXE}${options.newLineAfter ? '\n' : ''}`,
      ),
    )
  }

  nodemon(str: string, options: NewLineOptions = {}): void {
    if (suppress) return

    console.log(
      chalk.yellow(
        `${options.newLineBefore ? '\n' : ''}${COG}  [nodemon] ${str}${options.newLineAfter ? '\n' : ''}`,
      ),
    )
  }

  point(str: string, indent: number = 0): void {
    if (suppress) return
    console.log(`${' '.repeat(indent)}${this.primary(BULLET)} ${str}`)
  }

  report(header: string, str: string): void {
    if (suppress) return
    console.log(`${chalk.magenta(header)} ${str}`)
  }

  section(str: string): void {
    if (suppress) return
    console.log(`\n${this.primary.bold.underline(`${str}`)}`)
  }

  success(str: string, indent: number = 0): void {
    if (suppress) return
    console.log(`${' '.repeat(indent)}${chalk.green(CHECK)} ${str}`)
  }

  wait(str: string): void {
    if (suppress) return
    console.log(`${HOURGLASS} ${str}`)
  }

  warn(str: string): void {
    if (suppress) return
    console.log(`${chalk.yellow(BULLET)} ${str}`)
  }

  work(str: string): void {
    if (suppress) return
    console.log(chalk.yellow(`🛠  ${str}`))
  }
}

const internalLogger = new InternalLogger()
export default internalLogger

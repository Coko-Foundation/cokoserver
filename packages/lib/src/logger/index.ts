import pino from 'pino'
import pretty from 'pino-pretty'

import { env } from '../utils/env'

let logger: pino.Logger

if (env('NODE_ENV') === 'production') {
  logger = pino({
    formatters: {
      level: label => {
        return { level: label.toUpperCase() }
      },
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  })
} else {
  logger = pino(
    pretty({
      sync: true,
    }),
  )
}

/**
 * Do not use config here, as config itself imports the logger, creating a
 * circular dependency.
 */

const isTest = env('NODE_ENV') === 'test'
const suppress =
  isTest && env('SUPPRESS_LOGGER_IN_TEST_ENV', { type: 'boolean' })

export default {
  error: (...args: any[]): void => {
    if (suppress) return
    logger.error(args[0], ...args.slice(1))
  },
  warn: (...args: any[]): void => {
    if (suppress) return
    logger.warn(args[0], ...args.slice(1))
  },
  info: (...args: any[]): void => {
    if (suppress) return
    logger.info(args[0], ...args.slice(1))
  },
  debug: (...args: any[]): void => {
    if (suppress) return
    logger.debug(args[0], ...args.slice(1))
  },
}

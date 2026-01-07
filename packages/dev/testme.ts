const { logger } = require('@coko/server')

export default function greet(name: string): void {
  logger.info(`Hello, ${name.toUpperCase()}!`)
}

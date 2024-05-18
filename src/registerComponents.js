const config = require('config')
const chalk = require('chalk')

const logger = require('./logger')
const tryRequireRelative = require('./tryRequireRelative')

const registerRecursively = (app, componentName) => {
  const component = tryRequireRelative(componentName)
  logger.info(`${chalk.cyan('\u25cf')} Registered component ${componentName}`)
  const serverComponent = component.server || component.backend

  if (serverComponent) {
    serverComponent()(app)
    logger.info('Registered server component', componentName)
  }

  if (component.extending) {
    registerRecursively(app, component.extending)
  }
}

module.exports = app => {
  logger.info(`\n${chalk.cyan('Task:')} Register components\n`)

  if (config.has('pubsweet.components')) {
    config.get('pubsweet.components').forEach(componentName => {
      registerRecursively(app, componentName)
    })
  }
}

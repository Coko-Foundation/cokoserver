const config = require('config')

const logger = require('./logger')
const { logTask, logTaskItem } = require('./logger/internals')
const tryRequireRelative = require('./tryRequireRelative')

const registerRecursively = (app, componentName) => {
  const component = tryRequireRelative(componentName)
  logTaskItem(`Registered component ${componentName}`)
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
  logTask('Register components')

  if (config.has('components')) {
    config.get('components').forEach(componentName => {
      registerRecursively(app, componentName)
    })
  }
}

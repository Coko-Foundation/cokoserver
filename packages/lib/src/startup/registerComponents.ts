// @ts-nocheck

import config from '../configManager/config'
import logger from '../logger'
import { logTask, logTaskItem } from '../logger/internals'
import tryRequireRelative from '../utils/tryRequireRelative'

const registerRecursively = async (app, componentName): void => {
  // console.log(componentName)
  const component = await tryRequireRelative(componentName)
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

const registerComponents = async (app): Promise<void> => {
  logTask('Register components')

  if (config.has('components')) {
    await Promise.all(
      config.get('components').map(async componentName => {
        await registerRecursively(app, componentName)
      }),
    )
  }
}

export default registerComponents

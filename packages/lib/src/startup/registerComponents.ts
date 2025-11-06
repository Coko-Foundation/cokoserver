import { Express } from 'express'
import config from '../configManager/config'
import logger from '../logger'
import { logTask, logTaskItem } from '../logger/internals'
import loadComponent from '../utils/loadComponent'

const registerComponents = async (app: Express): Promise<void> => {
  logTask('Register components')
  const components = config.get('components') || []

  await Promise.all(
    components.map(async (componentName: string) => {
      const component = await loadComponent(componentName)
      logTaskItem(`Registered component ${componentName}`)
      const serverComponent = component.server

      if (serverComponent) {
        serverComponent()(app)
        logger.info('Registered server component', componentName)
      }
    }),
  )
}

export default registerComponents

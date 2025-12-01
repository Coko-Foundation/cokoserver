import { Express } from 'express'
import config from '../configManager/config'
import logger from '../logger'
import internalLogger from '../logger/internals'
import loadComponent from '../utils/loadComponent'

const registerComponents = async (app: Express): Promise<void> => {
  internalLogger.section('Register components')
  const components = config.get('components') || []

  await Promise.all(
    components.map(async (componentName: string) => {
      const component = await loadComponent(componentName)
      internalLogger.success(`Registered component ${componentName}`)
      const serverComponent = component.server

      if (serverComponent) {
        serverComponent()(app)
        logger.info('Registered server component', componentName)
      }
    }),
  )
}

export default registerComponents

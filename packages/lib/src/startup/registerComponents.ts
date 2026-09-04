import { Express } from 'express'
import config from '../configManager/config'
import internalLogger from '../logger/internals'
import loadComponent from '../utils/loadComponent'

const registerComponents = async (app: Express): Promise<void> => {
  internalLogger.section('Register components')
  const components = config.get('components') || []

  await Promise.all(
    components.map(async (componentName: string) => {
      const component = await loadComponent(componentName)

      const serverComponent = component.server
      if (serverComponent) serverComponent()(app)

      internalLogger.success(`Registered component ${componentName}`)
    }),
  )
}

export default registerComponents

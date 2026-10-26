import path from 'path'
import { getAppRoot } from './filesystem'

type Component = {
  // model:
  modelName?: string
  typeDefs?: string
  resolvers?: object
  server?: Function
}

const loadComponent = async (componentPath: string): Promise<Component> => {
  try {
    let p: string

    const root = getAppRoot()

    if (componentPath.startsWith('.')) {
      p = path.join(root, componentPath)
    } else {
      p = path.dirname(require.resolve(componentPath))
    }

    const { default: component } = await import(p)
    return component
  } catch (e) {
    throw new Error(`Unable to load component ${componentPath}. ${e}`)
  }
}

export default loadComponent

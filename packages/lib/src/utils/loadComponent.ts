import path from 'path'

type Component = {
  // model:
  modelName?: string
  typeDefs?: string
  server?: Function
}

const loadComponent = async (componentPath: string): Promise<Component> => {
  try {
    const p = path.join(process.cwd(), componentPath)
    const { default: component } = await import(p)
    return component
  } catch (e) {
    throw new Error(`Unable to load component ${componentPath}. ${e}`)
  }
}

export default loadComponent

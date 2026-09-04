import DataLoader from 'dataloader'

import config from '../configManager/config'
import loadComponent from '../utils/loadComponent'

type Loaders = Record<string, any>

const defaultLoader = (model: any): DataLoader<any, any> =>
  new DataLoader(async ids => {
    const results = await model.query().whereIn('id', ids)
    // We map over ids so that the DataLoader API is always matched,
    // i.e. array of keys in, array of results out (even if some records are not found)
    return ids.map(id => results.find(result => result.id === id))
  })

export default async (): Promise<Loaders> => {
  const componentNames: string[] =
    config.has('components') && Array.isArray(config.get('components'))
      ? config.get('components')
      : []

  const components = []

  for (const name of componentNames) {
    /* eslint-disable-next-line no-await-in-loop */
    components.push(await loadComponent(name))
  }

  const loaders = {}

  components.forEach(component => {
    if (component.model && component.modelName) {
      // Sets up the default loader, that gets model instances by id
      // You can use it with e.g. context.loaders.User.load(id)
      loaders[component.modelName] = defaultLoader(component.model)

      // Allows for custom model loaders, that can be used e.g.
      // context.loaders.User.customLoader.load(id)
      if (component.modelLoaders) {
        Object.keys(component.modelLoaders).forEach(loaderName => {
          loaders[component.modelName][loaderName] = new DataLoader(
            component.modelLoaders[loaderName],
          )
        })
      }
    } else if (component.models) {
      // If there are multiple models specified in a single component
      // each can specify its own loaders
      component.models.forEach(model => {
        loaders[model.modelName] = defaultLoader(model.model)

        if (model.modelLoaders) {
          Object.keys(model.modelLoaders).forEach(loaderName => {
            loaders[model.modelName][loaderName] = new DataLoader(
              model.modelLoaders[loaderName],
            )
          })
        }
      })
    }

    // Allows for top-level loaders, which you can use like so:
    // context.loaders.yourCustomLoader.load()
    if (component.loaders) {
      Object.keys(component.loaders).forEach(loaderName => {
        loaders[loaderName] = new DataLoader(component.loaders[loaderName])
      })
    }
  })

  return loaders
}

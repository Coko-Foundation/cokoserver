import DataLoader from 'dataloader'

import config from '../configManager/config'
import loadComponent from '../utils/loadComponent'

type Loaders = Record<string, any>
type BatchFn = DataLoader.BatchLoadFn<any, any>

type BatchFnEntry = {
  batchFn: BatchFn
  // Custom model loaders, attached to the model's default loader
  modelLoaders?: Record<string, BatchFn>
}

export type BatchFns = Record<string, BatchFnEntry>

const defaultBatchFn =
  (model: any): BatchFn =>
  async ids => {
    const results = await model.query().whereIn('id', ids)
    // We map over ids so that the DataLoader API is always matched,
    // i.e. array of keys in, array of results out (even if some records are not found)
    return ids.map(id => results.find(result => result.id === id))
  }

/**
 * Collects the batch functions of all components.
 * Meant to run once at startup, as it needs to load the components.
 */
export const collectBatchFns = async (): Promise<BatchFns> => {
  const componentNames: string[] =
    config.has('components') && Array.isArray(config.get('components'))
      ? config.get('components')
      : []

  const components = []

  for (const name of componentNames) {
    /* eslint-disable-next-line no-await-in-loop */
    components.push(await loadComponent(name))
  }

  const batchFns: BatchFns = {}

  components.forEach(component => {
    if (component.model && component.modelName) {
      batchFns[component.modelName] = {
        batchFn: defaultBatchFn(component.model),
        modelLoaders: component.modelLoaders,
      }
    } else if (component.models) {
      // If there are multiple models specified in a single component
      // each can specify its own loaders
      component.models.forEach(model => {
        batchFns[model.modelName] = {
          batchFn: defaultBatchFn(model.model),
          modelLoaders: model.modelLoaders,
        }
      })
    }

    if (component.loaders) {
      Object.keys(component.loaders).forEach(loaderName => {
        batchFns[loaderName] = { batchFn: component.loaders[loaderName] }
      })
    }
  })

  return batchFns
}

/**
 * Creates fresh DataLoader instances from the collected batch functions.
 * Meant to run on every request, so that caches are not shared between requests.
 */
export const buildLoaders = (
  batchFns: BatchFns,
  options?: DataLoader.Options<any, any>,
): Loaders => {
  const loaders = {}

  Object.keys(batchFns).forEach(name => {
    const { batchFn, modelLoaders } = batchFns[name]

    // Sets up the default loader, that gets model instances by id
    // You can use it with e.g. context.loaders.User.load(id)
    // Top-level loaders can be used the same way, e.g.
    // context.loaders.yourCustomLoader.load()
    loaders[name] = new DataLoader(batchFn, options)

    // Allows for custom model loaders, that can be used e.g.
    // context.loaders.User.customLoader.load(id)
    if (modelLoaders) {
      Object.keys(modelLoaders).forEach(loaderName => {
        loaders[name][loaderName] = new DataLoader(
          modelLoaders[loaderName],
          options,
        )
      })
    }
  })

  return loaders
}

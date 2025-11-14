import config from '../configManager/config'
import PostgresPubSub from './PostgresPubSub'
import { getDbConnectionConfig } from '../db'
import GraphQLDisabledError from './GraphQLDisabledError'

const connectionConfig = getDbConnectionConfig('subscriptionsDb')

// export for testing
export function createExportablePubsub(): PostgresPubSub {
  const instance = new PostgresPubSub(connectionConfig)

  if (config.get('useGraphQLServer')) return instance

  return new Proxy(instance, {
    // trap intercepts property/method access
    get: (target, property, receiver): any => {
      if (typeof target[property] === 'function' || property in target) {
        throw new GraphQLDisabledError()
      }

      // fallback for built-in properties (like toString, etc.)
      return Reflect.get(target, property, receiver)
    },
  })
}

const exportedClass = createExportablePubsub()
export default exportedClass

import config from '../configManager/config'
import PostgresPubSub from './PostgresPubSub'
import getDbConnectionConfig from '../db/connectionConfig'
import GraphQLDisabledError from './GraphQLDisabledError'

class PubsubManager {
  public instance: PostgresPubSub

  init(): void {
    // if (this.instance) return

    const connectionConfig = getDbConnectionConfig('subscriptionsDb')
    const realInstance = new PostgresPubSub(connectionConfig)

    if (config.get('useGraphQLServer')) {
      this.instance = realInstance
      return
    }

    this.instance = new Proxy(realInstance, {
      get: (target, property, receiver): any => {
        if (typeof target[property] === 'function' || property in target) {
          throw new GraphQLDisabledError()
        }

        // fallback for built-in properties (like toString, etc.)
        return Reflect.get(target, property, receiver)
      },
    })
  }
}

const manager = new PubsubManager()

const pubsub = new Proxy(manager, {
  get(target, prop): any {
    if (prop === 'init') return target.init.bind(target)

    if (!target.instance) {
      throw new Error(
        'subcriptionManager not initialized. Run subcriptionManager.init() first.',
      )
    }

    const value = (target.instance as any)[prop]
    return typeof value === 'function' ? value.bind(target.instance) : value
  },
}) as unknown as PostgresPubSub & { init: () => void }

export default pubsub

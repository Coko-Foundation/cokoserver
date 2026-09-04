import config from '../configManager/config'
import FileStorage from './FileStorage'
import FileStorageNoop from './FileStorageNoop'

type IFileStorage = FileStorage | FileStorageNoop

class FileStorageManager {
  public instance: IFileStorage

  init(): void {
    if (this.instance) return

    this.instance = config.get('fileStorage')
      ? new FileStorage()
      : new FileStorageNoop()
  }
}

const manager = new FileStorageManager()

/**
 * The Proxy intercepts all calls.
 * Before init() is called, instance is null.
 * After init() is called, instance is the specific implementation.
 */
const fileStorageProxy = new Proxy(manager, {
  get(target, prop): any {
    // 1. Allow calling .init() on the proxy itself
    if (prop === 'init') return target.init.bind(target)

    // 2. Ensure the instance is ready
    if (!target.instance) {
      throw new Error(
        'FileStorage has not been initialized. Please call fileStorage.init() first.',
      )
    }

    // 3. Forward the property/method access to the actual instance
    const value = (target.instance as any)[prop]
    return typeof value === 'function' ? value.bind(target.instance) : value
  },
}) as unknown as IFileStorage & { init: () => void }

export default fileStorageProxy

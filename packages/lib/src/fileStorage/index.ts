import config from '../configManager/config'
import FileStorage from './FileStorage'
import FileStorageNoop from './FileStorageNoop'

const exportedClass = config.get('fileStorage')
  ? new FileStorage()
  : new FileStorageNoop()

export default exportedClass

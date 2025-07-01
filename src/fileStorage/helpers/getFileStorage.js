const fileStorage = require('./fileStorage')
const FileStorageConstructor = require('../FileStorage')

const getFileStorage = connectionConfig => {
  if (!connectionConfig) return fileStorage
  return new FileStorageConstructor(connectionConfig)
}

module.exports = getFileStorage

/* eslint-disable max-classes-per-file */

const config = require('config')

const FileStorage = require('../FileStorage')
const FileStorageNoop = require('../FileStorageNoop')

const exportedClass =
  config.has('useFileStorage') && config.get('useFileStorage')
    ? new FileStorage()
    : new FileStorageNoop()

module.exports = exportedClass

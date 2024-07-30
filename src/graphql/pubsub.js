const config = require('config')

const PostgresPubSub = require('./PostgresPubSub')
const PostgresPubSubNoop = require('./PostgresPubSubNoop')
const { getDbConnectionConfig } = require('../db')

const connectionConfig = getDbConnectionConfig()

const exportedClass =
  config.has('useGraphQLServer') && config.get('useGraphQLServer')
    ? new PostgresPubSub(connectionConfig)
    : new PostgresPubSubNoop()

module.exports = exportedClass

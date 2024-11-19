const config = require('config')

const PostgresPubSub = require('./PostgresPubSub')
const PostgresPubSubNoop = require('./PostgresPubSubNoop')
const { getDbConnectionConfig } = require('../db')

const connectionConfig = getDbConnectionConfig('subscriptionsDb')

let useGraphQLServer = true

if (
  config.has('useGraphQLServer') &&
  config.get('useGraphQLServer') === false
) {
  useGraphQLServer = false
}

const exportedClass = useGraphQLServer
  ? new PostgresPubSub(connectionConfig)
  : new PostgresPubSubNoop()

module.exports = exportedClass

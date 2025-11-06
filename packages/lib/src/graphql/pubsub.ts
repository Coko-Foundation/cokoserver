import config from '../configManager/config'
import PostgresPubSub from './PostgresPubSub'
import PostgresPubSubNoop from './PostgresPubSubNoop'
import { getDbConnectionConfig } from '../db'

const connectionConfig = getDbConnectionConfig('subscriptionsDb')
const useGraphQLServer = config.get('useGraphQLServer')

const exportedClass = useGraphQLServer
  ? new PostgresPubSub(connectionConfig)
  : new PostgresPubSubNoop()

export default exportedClass

import cors from 'cors'

import config from '../configManager/config'
import { clientUrl } from '../utils/urls'

import { logTask, logTaskItem } from '../logger/internals'

const createCORSConfig = () => {
  logTask('Setting CORS origin')

  const fromConfig = config.has('corsOrigin') && config.get('corsOrigin')

  if (!clientUrl && !fromConfig) return null

  const defaultList = [clientUrl].filter(i => !!i)
  let extra = []

  if (fromConfig) {
    if (Array.isArray(fromConfig)) {
      extra = fromConfig
    } else {
      extra = fromConfig.split(',').map(i => i.trim())
    }
  }

  return {
    origin: [...defaultList, ...extra],
    credentials: true,
  }
}

const middleware = () => {
  const corsConfig = createCORSConfig()
  logTaskItem(`CORS origin set to: ${corsConfig?.origin?.toString() || 'null'}`)
  return cors(corsConfig)
}

export default middleware

const cors = require('cors')
const config = require('config')

const { clientUrl } = require('../utils/urls')

const { logTask, logTaskItem } = require('../logger/internals')

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
  logTaskItem(`CORS origin set to: ${corsConfig.origin.toString()}`)
  return cors(corsConfig)
}

module.exports = middleware

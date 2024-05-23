const cors = require('cors')

const { clientUrl } = require('../utils/urls')

const createCORSConfig = () => {
  if (!clientUrl) return null

  return {
    origin: clientUrl,
    credentials: true,
  }
}

const corsMiddleware = () => {
  const config = createCORSConfig()
  return cors(config)
}

module.exports = {
  corsConfig: createCORSConfig,
  cors: corsMiddleware,
}

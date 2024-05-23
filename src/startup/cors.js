const cors = require('cors')

const { clientUrl } = require('../utils/urls')

const createCORSConfig = () => {
  if (!clientUrl) return null

  const config = {
    origin: clientUrl,
    credentials: true,
  }

  return cors(config)
}

module.exports = createCORSConfig

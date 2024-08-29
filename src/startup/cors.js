const cors = require('cors')

const { clientUrl } = require('../utils/urls')

const createCORSConfig = () => {
  if (!clientUrl) return null

  return {
    origin: clientUrl,
    credentials: true,
  }
}

const config = createCORSConfig()
const middleware = cors(config)

module.exports = middleware

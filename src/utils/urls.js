const config = require('config')

const removeTrailingSlashes = url => url.replace(/\/+$/, '')

const sanitizeUrl = url => {
  return removeTrailingSlashes(url)
}

const sanitizeUrlByConfigKey = configKey => {
  if (!config.has(configKey)) return null
  const url = config.get(configKey)
  return sanitizeUrl(url)
}

module.exports = {
  sanitizeUrlByConfigKey,
  clientUrl: sanitizeUrlByConfigKey('clientUrl'),
  serverUrl: sanitizeUrlByConfigKey('serverUrl'),
}

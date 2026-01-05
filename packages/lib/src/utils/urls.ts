import config from '../configManager/config'

const removeTrailingSlashes = (url: string): string => url.replace(/\/+$/, '')

const sanitizeUrl = (url: string): string => {
  return removeTrailingSlashes(url)
}

const sanitizeUrlByConfigKey = (configKey: string): string => {
  if (!config.has(configKey)) return null
  const url = config.get(configKey)
  return sanitizeUrl(url)
}

let clientUrl: string, serverUrl: string

function initUrls(): void {
  clientUrl = sanitizeUrlByConfigKey('clientUrl')
  serverUrl = sanitizeUrlByConfigKey('serverUrl')
}

export { sanitizeUrlByConfigKey, clientUrl, serverUrl, initUrls }

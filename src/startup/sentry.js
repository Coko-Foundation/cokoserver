const Sentry = require('@sentry/node')
const config = require('config')

const dsn = config.has('sentry.dsn') && config.get('sentry.dsn')

const environment =
  config.has('sentry.environment') && config.get('sentry.environment')

if (dsn) {
  Sentry.init({
    dsn,
    environment,
    sendDefaultPii: true,
  })
}

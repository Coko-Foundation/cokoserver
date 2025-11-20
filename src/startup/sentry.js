const Sentry = require('@sentry/node')
const config = require('config')

const dsn = config.has('sentry.dsn') && config.get('sentry.dsn')

if (dsn) {
  Sentry.init({
    dsn: config.get('sentry.dsn'),
    sendDefaultPii: true,
  })
}

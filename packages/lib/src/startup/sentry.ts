import Sentry from '@sentry/node'

import config from '../configManager/config'

const dsn = config.get('sentry.dsn')
const environment = config.get('sentry.environment')

if (dsn) {
  Sentry.init({
    dsn,
    environment,
    sendDefaultPii: true,
  })
}

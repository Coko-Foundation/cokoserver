const config = require('config')

const { isEnvVariableTrue } = require('../utils/env')

const getDbConnectionConfig = () => {
  const connectionConfig = config.get('db')

  // clone to allow mutation for the case of adding ssl
  const connection = { ...connectionConfig }

  if (isEnvVariableTrue(process.env.POSTGRES_ALLOW_SELF_SIGNED_CERTIFICATES)) {
    if (!connection.ssl) connection.ssl = {}
    connection.ssl.rejectUnauthorized = false
  }

  return connection
}

module.exports = getDbConnectionConfig

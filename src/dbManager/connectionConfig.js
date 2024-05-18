const config = require('config')

const { isEnvVariableTrue } = require('../utils/env')

const connectionConfig =
  config['pubsweet-server'] && config['pubsweet-server'].db

// clone to allow mutation for the case of adding ssl
const connection = { ...connectionConfig }

if (isEnvVariableTrue(process.env.POSTGRES_ALLOW_SELF_SIGNED_CERTIFICATES)) {
  if (!connection.ssl) connection.ssl = {}
  connection.ssl.rejectUnauthorized = false
}

module.exports = connection

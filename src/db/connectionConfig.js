const config = require('config')

const getDbConnectionConfig = () => {
  const { allowSelfSignedCertificates, ...connectionConfig } = config.get('db')

  // clone to get around an issue of knex deleting password from the original object
  const connection = { ...connectionConfig }

  if (allowSelfSignedCertificates) {
    if (!connection.ssl) connection.ssl = {}
    connection.ssl.rejectUnauthorized = false
  }

  return connection
}

module.exports = getDbConnectionConfig

const config = require('config')

const getDbConnectionConfig = () => {
  const { allowSelfSignedCertificates, caCert, ...connectionConfig } =
    config.get('db')

  // clone to get around an issue of knex deleting password from the original object
  const connection = { ...connectionConfig }

  if (allowSelfSignedCertificates) {
    if (!connection.ssl) connection.ssl = {}
    connection.ssl.rejectUnauthorized = false
  }

  if (caCert) {
    if (!connection.ssl) connection.ssl = {}
    connection.ssl.rejectUnauthorized = true

    /**
     * The value of the env variable should be the base64 encoded crt file.
     * eg. the result of `base64 -w0 ca-certificate.crt`
     * It gets decoded here. This is to prevent issues with newlines when trying
     * to pass the contents of a cert file as an environment variable in some
     * deployment environments.
     */
    connection.ssl.ca = Buffer.from(caCert, 'base64').toString('utf-8')
  }

  return connection
}

module.exports = getDbConnectionConfig

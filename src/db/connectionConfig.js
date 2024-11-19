const config = require('config')

const getDbConnectionConfig = (key = 'db') => {
  let { allowSelfSignedCertificates, caCert, ...connectionConfig } =
    config.get(key)

  // clone to get around an issue of knex deleting password from the original object
  let connection = { ...connectionConfig }

  // Fallback to the values of db for the keys that are not defined
  if (key !== 'db') {
    const {
      allowSelfSignedCertificatesDefault,
      caCertDefault,
      ...connectionConfigDefault
    } = config.get('db')

    connection = { ...connectionConfigDefault, ...connection }

    if (typeof allowSelfSignedCertificates === 'undefined') {
      allowSelfSignedCertificates = allowSelfSignedCertificatesDefault
    }

    caCert = caCert || caCertDefault
  }

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

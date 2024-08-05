const config = require('config')

const getDbConnectionConfig = () => {
  const connectionConfig = config.get('db')

  // clone to get around an issue of knex deleting password from the original object
  const connection = { ...connectionConfig }

  return connection
}

module.exports = getDbConnectionConfig

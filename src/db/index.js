const db = require('./db')
const { migrationManager } = require('./migrate')
const connectionConfig = require('./connectionConfig')

module.exports = {
  db,
  migrationManager,
  getDbConnectionConfig: connectionConfig,
}

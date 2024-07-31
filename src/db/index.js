const db = require('./db')
const { migrationManager } = require('./migrate')
const connectionConfig = require('./connectionConfig')
const { MIGRATIONS_TABLE, META_TABLE } = require('./migrateDbHelpers')

module.exports = {
  db,
  migrationManager,
  getDbConnectionConfig: connectionConfig,
  MIGRATIONS_TABLE_NAME: MIGRATIONS_TABLE,
  META_TABLE_NAME: META_TABLE,
}

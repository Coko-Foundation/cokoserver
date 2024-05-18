const db = require('./db')

const MIGRATIONS_TABLE = 'migrations'
const META_TABLE = 'coko_server_meta'

const migrations = {
  createTable: async () =>
    db.raw(`
      CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
        id TEXT PRIMARY KEY,
        run_at TIMESTAMPTZ DEFAULT current_timestamp
      )
    `),

  getLastMigration: async () => {
    const row = await db(MIGRATIONS_TABLE)
      .select('id')
      .orderBy('runAt', 'desc')
      .first()

    return row.id
  },

  getRows: async () => db(MIGRATIONS_TABLE).orderBy('runAt', 'asc'),

  logMigration: async migrationName =>
    db.raw(`INSERT INTO ${MIGRATIONS_TABLE} (id) VALUES (?)`, [migrationName]),

  unlogMigration: async migrationName =>
    db.raw(`DELETE FROM ${MIGRATIONS_TABLE} WHERE id = ?`, [migrationName]),
}

const meta = {
  clearCheckpoint: async () =>
    db(META_TABLE).update({
      lastSuccessfulMigrateCheckpoint: null,
    }),

  exists: async () => db.schema.hasTable(META_TABLE),

  getCheckpoint: async () => {
    const row = await db(META_TABLE)
      .select('lastSuccessfulMigrateCheckpoint')
      .first()

    return row.lastSuccessfulMigrateCheckpoint
  },

  getData: async () => {
    const rows = await db(META_TABLE)
    return rows[0] // this table always has one row only
  },

  setCheckpoint: async value =>
    db(META_TABLE).update({
      lastSuccessfulMigrateCheckpoint: value,
    }),
}

module.exports = { migrations, meta }

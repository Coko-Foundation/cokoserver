import db from './db'

const MIGRATIONS_TABLE = 'migrations'
const META_TABLE = 'coko_server_meta'

const migrations = {
  createTable: async (): Promise<void> =>
    db.raw(`
      CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
        id TEXT PRIMARY KEY,
        run_at TIMESTAMPTZ DEFAULT current_timestamp
      )
    `),

  getLastMigration: async (): Promise<string> => {
    const row = await db(MIGRATIONS_TABLE)
      .select('id')
      .orderBy('runAt', 'desc')
      .first()

    return row.id
  },

  getRows: async () => db(MIGRATIONS_TABLE).orderBy('runAt', 'asc'),

  logMigration: async (migrationName: string): Promise<void> => {
    console.log('huh', migrationName)
    await db.raw(`INSERT INTO ${MIGRATIONS_TABLE} (id) VALUES (?)`, [
      migrationName,
    ])
  },

  unlogMigration: async (migrationName: string): Promise<void> =>
    db.raw(`DELETE FROM ${MIGRATIONS_TABLE} WHERE id = ?`, [migrationName]),
}

const migrationsMeta = {
  clearCheckpoint: async (): Promise<void> =>
    db(META_TABLE).update({
      lastSuccessfulMigrateCheckpoint: null,
    }),

  exists: async (): Promise<boolean> => db.schema.hasTable(META_TABLE),

  getCheckpoint: async (): Promise<string> => {
    const row = await db(META_TABLE)
      .select('lastSuccessfulMigrateCheckpoint')
      .first()

    return row.lastSuccessfulMigrateCheckpoint
  },

  getData: async () => {
    const rows = await db(META_TABLE)
    return rows[0] // this table always has one row only
  },

  setCheckpoint: async (value): Promise<void> =>
    db(META_TABLE).update({
      lastSuccessfulMigrateCheckpoint: value,
    }),
}

export { migrations, migrationsMeta, MIGRATIONS_TABLE, META_TABLE }

import db from './db'

const MIGRATIONS_TABLE = 'migrations'
const META_TABLE = 'coko_server_meta'

type MigrationRow = {
  id: string
  runAt: string
}

type MetaRow = {
  id: string
  created: string
  lastSuccessfulMigrateCheckpoint?: string
}

const migrations = {
  createTable: async (): Promise<void> => {
    await db.raw(`
      CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
        id TEXT PRIMARY KEY,
        run_at TIMESTAMPTZ DEFAULT current_timestamp
      )
    `)
  },

  getLastMigration: async (): Promise<string> => {
    const row = await db(MIGRATIONS_TABLE)
      .select('id')
      .orderBy('runAt', 'desc')
      .first()

    return row.id
  },

  getRows: async (): Promise<MigrationRow[]> => {
    return await db(MIGRATIONS_TABLE).orderBy('runAt', 'asc')
  },

  logMigration: async (migrationName: string): Promise<void> => {
    await db.raw(`INSERT INTO ${MIGRATIONS_TABLE} (id) VALUES (?)`, [
      migrationName,
    ])
  },

  unlogMigration: async (migrationName: string): Promise<void> => {
    await db(MIGRATIONS_TABLE).where({ id: migrationName }).delete()
  },
}

const migrationsMeta = {
  clearCheckpoint: async (): Promise<void> => {
    await db(META_TABLE).update({
      lastSuccessfulMigrateCheckpoint: null,
    })
  },

  exists: async (): Promise<boolean> => {
    return await db.schema.hasTable(META_TABLE)
  },

  getCheckpoint: async (): Promise<string> => {
    const row = await db(META_TABLE)
      .select('lastSuccessfulMigrateCheckpoint')
      .first()

    return row.lastSuccessfulMigrateCheckpoint
  },

  getData: async (): Promise<MetaRow> => {
    const rows = await db(META_TABLE)
    return rows[0] // this table always has one row only
  },

  setCheckpoint: async (value): Promise<void> => {
    await db(META_TABLE).update({
      lastSuccessfulMigrateCheckpoint: value,
    })
  },
}

export { migrations, migrationsMeta, MIGRATIONS_TABLE, META_TABLE }

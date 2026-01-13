import { Knex } from 'knex'

const TABLE_NAME = 'coko_server_meta'
const COLUMN_NAME = 'pg_boss_schema'

export async function up(db: Knex): Promise<void> {
  db.schema.alterTable(TABLE_NAME, t => {
    t.string(COLUMN_NAME)
  })
}

export async function down(db: Knex): Promise<void> {
  db.schema.alterTable(TABLE_NAME, t => {
    t.dropColumn(COLUMN_NAME)
  })
}

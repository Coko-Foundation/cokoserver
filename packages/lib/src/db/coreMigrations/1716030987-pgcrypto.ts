import { Knex } from 'knex'

export async function up(db: Knex): Promise<void> {
  return db.raw(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
  `)
}

export async function down(db: Knex): Promise<void> {
  return db.raw(`
    DROP EXTENSION IF EXISTS pgcrypto;
  `)
}

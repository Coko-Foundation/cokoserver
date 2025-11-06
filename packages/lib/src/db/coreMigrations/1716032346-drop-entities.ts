import { Knex } from 'knex'

export async function up(db: Knex): Promise<void> {
  return db.raw(`
    DROP TABLE IF EXISTS entities;
  `)
}

export async function down(db: Knex): Promise<void> {
  return db.raw(`
    CREATE TABLE IF NOT EXISTS entities (id UUID PRIMARY KEY, data JSONB);
  `)
}

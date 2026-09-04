import { Knex } from 'knex'

export const up = async (db: Knex): Promise<void> => {
  await db.schema.alterTable('identities', table => {
    table.dropForeign(['user_id'])

    table
      .foreign('user_id')
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
      .onUpdate('CASCADE')
  })
}

export const down = async (db: Knex): Promise<void> => {
  await db.schema.alterTable('identities', table => {
    table.dropForeign(['user_id'])
    table.foreign('user_id').references('id').inTable('users')
  })
}

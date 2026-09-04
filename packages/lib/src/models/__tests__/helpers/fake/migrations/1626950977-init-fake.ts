import { Knex } from 'knex'

export const up = async (knex: Knex): Promise<void> => {
  await knex.schema.createTable('fakes', table => {
    table.uuid('id').primary()
    table
      .timestamp('created', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now())
    table.timestamp('updated', { useTz: true })
    table.uuid('user_id').references('users.id')
    table.text('type').notNullable()
    table.text('status')
    table.timestamp('timestamp', { useTz: true })
  })
}

export const down = async (knex: Knex): Promise<void> => {
  await knex.schema.dropTable('fakes')
}

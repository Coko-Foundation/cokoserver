import { Knex } from 'knex'

export const up = async (knex: Knex): Promise<void> => {
  try {
    await knex.schema.createTable('chat_messages', table => {
      table.uuid('id').primary()
      table
        .timestamp('created', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now())
      table.timestamp('updated', { useTz: true })

      table.uuid('chat_thread_id').references('chat_threads.id').notNullable()

      table.uuid('user_id').references('users.id').notNullable()
      table.boolean('is_deleted').defaultTo(false)
      table.jsonb('mentions').defaultTo([])
      table.text('content').notNullable()

      table.text('type').notNullable()
    })
  } catch (e) {
    throw new Error(`Chat message: Initial: Migration failed! ${e}`)
  }
}

export const down = async (knex: Knex): Promise<void> => {
  await knex.schema.dropTable('chat_messages')
}

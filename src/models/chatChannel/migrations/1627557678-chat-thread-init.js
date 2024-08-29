exports.up = knex => {
  try {
    return knex.schema.createTable('chat_threads', table => {
      table.uuid('id').primary()
      table
        .timestamp('created', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now())
      table.timestamp('updated', { useTz: true })

      table.uuid('related_object_id').notNullable()

      table.string('chat_type').notNullable()

      table.text('type')
    })
  } catch (e) {
    throw new Error(`Chat Thread: Initial: Migration failed! ${e}`)
  }
}

exports.down = knex => {
  return knex.schema.dropTable('chat_threads')
}

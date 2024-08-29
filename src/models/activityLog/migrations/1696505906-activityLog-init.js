exports.up = knex => {
  try {
    return knex.schema.createTable('activity_logs', table => {
      table.uuid('id').primary()
      table
        .timestamp('created', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now())
      table.timestamp('updated', { useTz: true })

      table.uuid('actor_id').references('users.id').notNullable()
      table.text('action_type').notNullable()

      table.jsonb('value_before')
      table.jsonb('value_after')
      table.jsonb('affected_objects').defaultTo([])
      table.text('message')
      table.jsonb('additional_data')

      table.text('type').notNullable()
    })
  } catch (e) {
    throw new Error(`Acitivity log: Initial: Migration failed! ${e}`)
  }
}

exports.down = knex => {
  return knex.schema.dropTable('activity_logs')
}

exports.up = async knex => {
  return knex.schema.createTable('fakes', table => {
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

exports.down = async knex => {
  return knex.schema.dropTable('fakes')
}

exports.up = async knex => {
  try {
    return knex.schema.createTable('service_credential', table => {
      table.uuid('id').primary()
      table
        .timestamp('created', { useTz: true })
        .notNullable()
        .defaultTo(knex.fn.now())
      table.timestamp('updated', { useTz: true })
      table.text('type').notNullable()
      table.text('name').notNullable()
      table.text('accessToken').nullable()
    })
  } catch (e) {
    throw new Error(`Service Credentials: Initial: Migration failed! ${e}`)
  }
}

exports.down = async knex => {
  return knex.schema.dropTable('service_credential')
}

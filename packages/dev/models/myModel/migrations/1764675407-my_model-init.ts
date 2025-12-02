const TABLE_NAME = 'my_models'

export async function up(knex): Promise<void> {
  await knex.schema.createTable(TABLE_NAME, table => {
    table.uuid('id').primary()
    table
      .timestamp('created', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now())
    table.timestamp('updated', { useTz: true })
    table.text('type').notNullable()

    table.boolean('custom').notNullable().defaultTo(false)
  })
}

export async function down(knex): Promise<void> {
  await knex.schema.dropTable(TABLE_NAME)
}

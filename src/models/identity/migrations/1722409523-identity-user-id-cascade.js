exports.up = async db => {
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

exports.down = async db => {
  await db.schema.alterTable('identities', table => {
    table.dropForeign(['user_id'])
    table.foreign('user_id').references('id').inTable('users')
  })
}

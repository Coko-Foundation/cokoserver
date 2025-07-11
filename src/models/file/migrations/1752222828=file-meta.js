exports.up = knex => {
  return knex.schema.table('files', table => {
    table.jsonb('meta').defaultTo('{}')
  })
}

exports.down = knex => {
  return knex.schema.table('files', table => {
    table.dropColumn('meta')
  })
}

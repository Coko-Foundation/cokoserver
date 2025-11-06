export const up = knex => {
  return knex.schema.table('files', table => {
    table.jsonb('meta').defaultTo('{}')
  })
}

export const down = knex => {
  return knex.schema.table('files', table => {
    table.dropColumn('meta')
  })
}

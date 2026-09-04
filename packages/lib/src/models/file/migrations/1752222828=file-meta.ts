import { Knex } from 'knex'

export const up = async (knex: Knex): Promise<void> => {
  await knex.schema.table('files', table => {
    table.jsonb('meta').defaultTo('{}')
  })
}

export const down = async (knex: Knex): Promise<void> => {
  await knex.schema.table('files', table => {
    table.dropColumn('meta')
  })
}

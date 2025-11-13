import { Knex } from 'knex'

const TABLE_NAME = 'chat_messages'
const FOREIGN_TABLE_NAME = 'chat_channels'
const FOREIGN_KEY = 'chat_channel_id'

export const up = async (db: Knex): Promise<void> => {
  await db.schema.alterTable(TABLE_NAME, table => {
    table.dropForeign([FOREIGN_KEY])

    table
      .foreign(FOREIGN_KEY)
      .references('id')
      .inTable(FOREIGN_TABLE_NAME)
      .onDelete('CASCADE')
      .onUpdate('CASCADE')
  })
}

export const down = async (db: Knex): Promise<void> => {
  await db.schema.alterTable(TABLE_NAME, table => {
    table.dropForeign([FOREIGN_KEY])
    table.foreign(FOREIGN_KEY).references('id').inTable(FOREIGN_TABLE_NAME)
  })
}

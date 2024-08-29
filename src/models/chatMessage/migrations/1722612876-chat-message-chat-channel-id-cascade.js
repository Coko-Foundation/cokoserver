const TABLE_NAME = 'chat_messages'
const FOREIGN_TABLE_NAME = 'chat_channels'
const FOREIGN_KEY = 'chat_channel_id'

exports.up = async db => {
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

exports.down = async db => {
  await db.schema.alterTable(TABLE_NAME, table => {
    table.dropForeign([FOREIGN_KEY])
    table.foreign(FOREIGN_KEY).references('id').inTable(FOREIGN_TABLE_NAME)
  })
}

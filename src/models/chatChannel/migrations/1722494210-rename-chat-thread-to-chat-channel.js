const useTransaction = require('../../useTransaction')
const ChatChannel = require('../chatChannel.model')

const OLD_TABLE_NAME = 'chat_threads'
const NEW_TABLE_NAME = 'chat_channels'

const OLD_TYPE = 'chatThread'
const NEW_TYPE = 'chatChannel'

const OLD_COLUMN_NAME = 'chat_thread_id'
const NEW_COLUMN_NAME = 'chat_channel_id'

const MESSAGE_TABLE = 'chat_messages'

exports.up = async db => {
  await db.schema.renameTable(OLD_TABLE_NAME, NEW_TABLE_NAME)

  const channels = await ChatChannel.query()

  await useTransaction(async trx =>
    Promise.all(
      channels.map(async c => {
        await ChatChannel.query(trx).findById(c.id).patch({
          type: NEW_TYPE,
        })
      }),
    ),
  )

  await db.schema.table(MESSAGE_TABLE, async table => {
    table.dropForeign(OLD_COLUMN_NAME)
    table.renameColumn(OLD_COLUMN_NAME, NEW_COLUMN_NAME)
    table.foreign(NEW_COLUMN_NAME).references(`${NEW_TABLE_NAME}.id`)
  })
}

exports.down = async db => {
  await db.schema.renameTable(NEW_TABLE_NAME, OLD_TABLE_NAME)

  const threads = await db('chat_threads')

  await db.transaction(async trx =>
    Promise.all(
      threads.map(async thread => {
        await trx('chat_threads').where('id', thread.id).update({
          type: OLD_TYPE,
        })
      }),
    ),
  )

  await db.schema.table(MESSAGE_TABLE, async table => {
    table.dropForeign(NEW_COLUMN_NAME)
    table.renameColumn(NEW_COLUMN_NAME, OLD_COLUMN_NAME)
    table.foreign(OLD_COLUMN_NAME).references(`${OLD_TABLE_NAME}.id`)
  })
}

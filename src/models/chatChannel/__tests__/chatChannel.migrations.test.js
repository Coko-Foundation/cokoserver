const { v4: uuid } = require('uuid')

const { db, migrationManager } = require('../../../db')

const ChatChannel = require('../chatChannel.model')
const ChatMessage = require('../../chatMessage/chatMessage.model')
const User = require('../../user/user.model')
const Fake = require('../../__tests__/helpers/fake/fake.model')

describe('Chat channel migrations', () => {
  beforeEach(async () => {
    const tables = await db('pg_tables')
      .select('tablename')
      .where('schemaname', 'public')

    /* eslint-disable-next-line no-restricted-syntax */
    for (const t of tables) {
      /* eslint-disable-next-line no-await-in-loop */
      await db.raw(`DROP TABLE IF EXISTS public.${t.tablename} CASCADE`)
    }
  })

  afterAll(async () => {
    await db.destroy()
  })

  it('renames table from chat thread to chat channel', async () => {
    await migrationManager.migrate({
      to: '1722409523-identity-user-id-cascade.js',
    })

    const fake = await Fake.insert({})
    const user = await User.insert({})

    // Use knex directly, as the model uses a different table name now
    const threadsInsertResult = await db('chat_threads')
      .insert({
        id: uuid(),
        created: db.fn.now(),
        chatType: 'test',
        relatedObjectId: fake.id,
        type: 'chatThread',
      })
      .returning('*')

    const thread = threadsInsertResult[0]
    expect(thread.relatedObjectId).toBe(fake.id)
    expect(thread.chatType).toBe('test')
    expect(thread.type).toBe('chatThread')

    const messagesInsertResult = await db('chat_messages')
      .insert({
        id: uuid(),
        created: db.fn.now(),
        type: 'chatMessage',
        chatThreadId: thread.id,
        userId: user.id,
        content: 'hello',
      })
      .returning('*')

    const message = messagesInsertResult[0]
    expect(message.chatThreadId).toBe(thread.id)

    // Cannot delete because of foreign key constraint
    await expect(
      db('chat_threads').delete().where('id', thread.id),
    ).rejects.toThrow()

    await migrationManager.migrate({ step: 1 })

    // table doesn't exist anymore
    await expect(db('chat_threads')).rejects.toThrow()

    const channels = await ChatChannel.query()

    expect(channels).toHaveLength(1)
    const channel = channels[0]
    expect(channel.id).toBe(thread.id)
    expect(channel.relatedObjectId).toBe(fake.id)
    expect(channel.chatType).toBe('test')
    expect(channel.type).toBe('chatChannel')

    const modifiedMessage = await ChatMessage.findById(message.id)
    expect(modifiedMessage.chatChannelId).toBe(thread.id)

    // Foreign key constraint still there
    await expect(ChatChannel.deleteById(channel.id)).rejects.toThrow()

    // Column is still not nullable
    await expect(
      ChatMessage.insert({
        chatChannelId: null,
        userId: user.id,
        content: 'hello again',
      }),
    ).rejects.toThrow()

    await migrationManager.rollback({ step: 1 })

    await expect(db('chat_channels')).rejects.toThrow()

    const threadAgain = await db('chat_threads').where('id', thread.id).first()
    expect(threadAgain.type).toBe('chatThread')

    const messageAgain = await db('chat_messages')
      .where('chat_thread_id', thread.id)
      .first()

    expect(messageAgain.id).toBe(message.id)
  })
})

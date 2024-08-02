const { db, migrationManager } = require('../../../db')
const subscriptionManager = require('../../../graphql/pubsub')

const ChatMessage = require('../chatMessage.model')
const ChatChannel = require('../../chatChannel/chatChannel.model')
const User = require('../../user/user.model')
const Fake = require('../../__tests__/helpers/fake/fake.model')

describe('Chat message migrations', () => {
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
    await subscriptionManager.client.end()
  })

  it('adds an on delete and on update cascade on the user id column', async () => {
    await migrationManager.migrate({
      to: '1722494210-rename-chat-thread-to-chat-channel.js',
    })

    const user = await User.insert({})
    const fake = await Fake.insert({})

    const channel = await ChatChannel.insert({
      chatType: 'test',
      relatedObjectId: fake.id,
    })

    await ChatMessage.insert({
      chatChannelId: channel.id,
      content: 'hello',
      userId: user.id,
    })

    await ChatMessage.insert({
      chatChannelId: channel.id,
      content: 'hello again',
      userId: user.id,
    })

    let messages = await ChatMessage.find({
      chatChannelId: channel.id,
    })

    expect(messages.totalCount).toBe(2)

    // cannot delete because it violates a foreign key constraint
    await expect(ChatChannel.deleteById(channel.id)).rejects.toThrow()

    await migrationManager.migrate({ step: 1 })

    // deleting succeeds and messages are removed
    await ChatChannel.deleteById(channel.id)

    messages = await ChatMessage.find({
      chatChannelId: channel.id,
    })

    expect(messages.totalCount).toBe(0)

    // test rollback
    const anotherChannel = await ChatChannel.insert({
      chatType: 'test-again',
      relatedObjectId: fake.id,
    })

    await ChatMessage.insert({
      chatChannelId: anotherChannel.id,
      content: 'woot',
      userId: user.id,
    })

    await migrationManager.rollback({ step: 1 })

    await expect(ChatChannel.deleteById(anotherChannel.id)).rejects.toThrow()
  })
})

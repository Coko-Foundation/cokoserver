const { v4: uuid } = require('uuid')

const { db, migrationManager } = require('../../../db')
const subscriptionManager = require('../../../graphql/pubsub')

const {
  createChatChannelTeamWithUsers,
} = require('../../__tests__/helpers/teams')

const { ChatMessage, ChatChannel, User } = require('../../index')

const clearDb = require('../../__tests__/_clearDb')

describe('ChatMessage model', () => {
  beforeAll(async () => {
    await migrationManager.migrate()
  })

  beforeEach(async () => {
    await clearDb()
  })

  afterAll(async () => {
    await db.destroy()
    await subscriptionManager.client.end()
  })

  it('does not create a new chat message without content', async () => {
    const user = await User.insert({})
    const relatedObject = uuid()

    const channel = await ChatChannel.insert({
      chatType: 'editors',
      relatedObjectId: relatedObject,
    })

    const createMessageWithoutContent = () =>
      ChatMessage.insert({
        chatChannelId: channel.id,
        userId: user.id,
      })

    await expect(createMessageWithoutContent()).rejects.toThrow()

    const createMessageWithEmptyContent = () =>
      ChatMessage.insert({
        chatChannelId: channel.id,
        userId: user.id,
        content: '',
      })

    await expect(createMessageWithEmptyContent()).rejects.toThrow()
  })

  it('does not create a new chat message without a channel', async () => {
    const user = await User.insert({})

    const createMessage = () =>
      ChatMessage.insert({
        userId: user.id,
        content: 'test',
      })

    await expect(createMessage()).rejects.toThrow()
  })

  it('does not create a new chat message with an invalid channel', async () => {
    const user = await User.insert({})
    const channelId = uuid()

    const createMessage = () =>
      ChatMessage.insert({
        userId: user.id,
        content: 'test',
        chatChannelId: channelId,
      })

    await expect(createMessage()).rejects.toThrow()
  })

  it('does not create a new chat message without a user', async () => {
    const relatedObject = uuid()

    const channel = await ChatChannel.insert({
      chatType: 'authors',
      relatedObjectId: relatedObject,
    })

    const createMessage = () =>
      ChatMessage.insert({
        chatChannelId: channel.id,
        content: 'test',
      })

    await expect(createMessage()).rejects.toThrow()
  })

  it('does not create a new chat message with an invalid user', async () => {
    const userId = uuid()
    const relatedObject = uuid()

    const channel = await ChatChannel.insert({
      chatType: 'authors',
      relatedObjectId: relatedObject,
    })

    const createMessage = () =>
      ChatMessage.insert({
        chatChannelId: channel.id,
        content: 'test',
        userId,
      })

    await expect(createMessage()).rejects.toThrow()
  })

  it('fetches user of message', async () => {
    const user = await User.insert({})
    const relatedObject = uuid()

    const channel = await ChatChannel.insert({
      chatType: 'reviewers',
      relatedObjectId: relatedObject,
    })

    const message = await ChatMessage.insert({
      chatChannelId: channel.id,
      userId: user.id,
      content: '<p>this is a test</p>',
    })

    const result = await ChatMessage.findById(message.id, { related: 'user' })

    expect(result.user.id).toEqual(user.id)
  })

  it('adds mentioned user to chat message', async () => {
    const relatedObject = uuid()

    const channel = await ChatChannel.insert({
      chatType: 'reviewers',
      relatedObjectId: relatedObject,
    })

    const { user } = await createChatChannelTeamWithUsers(channel.id)

    const message = await ChatMessage.insert({
      chatChannelId: channel.id,
      userId: user.id,
      content: '<p>this is a test</p>',
      mentions: [user.id],
    })

    expect(message.mentions).toHaveLength(1)
    expect(message.mentions[0]).toEqual(user.id)
  })

  /* eslint-disable-next-line jest/no-commented-out-tests */
  // it('throws when mentioned user is not team member of channel', async () => {
  //   const user2 = await User.insert({})
  //   const relatedObject = uuid()

  //   const channel = await ChatChannel.insert({
  //     chatType: 'reviewers',
  //     relatedObjectId: relatedObject,
  //   })

  //   const { user } = await createChatChannelTeamWithUsers(channel.id)

  //   await expect(
  //     ChatMessage.insert({
  //       chatChannelId: channel.id,
  //       userId: user.id,
  //       content: '<p>this is a test</p>',
  //       mentions: [user2.id],
  //     }),
  //   ).rejects.toThrow()
  // })

  /* eslint-disable-next-line jest/no-commented-out-tests */
  // it('throws when updating a message mentions array with a user who is not team member of channel', async () => {
  //   const user2 = await User.insert({})
  //   const relatedObject = uuid()

  //   const channel = await ChatChannel.insert({
  //     chatType: 'reviewers',
  //     relatedObjectId: relatedObject,
  //   })

  //   const { user } = await createChatChannelTeamWithUsers(channel.id)

  //   const message = await ChatMessage.insert({
  //     chatChannelId: channel.id,
  //     userId: user.id,
  //     content: '<p>this is a test</p>',
  //   })

  //   await expect(
  //     message.patch({
  //       mentions: [user2.id],
  //     }),
  //   ).rejects.toThrow()
  // })
})

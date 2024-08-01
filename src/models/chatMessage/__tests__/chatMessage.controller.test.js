const { v4: uuid } = require('uuid')

const { db, migrationManager } = require('../../../db')

const ChatChannel = require('../../chatChannel/chatChannel.model')

const {
  createChatChannelTeamWithUsers,
} = require('../../__tests__/helpers/teams')

const {
  sendMessage,
  editMessage,
  deleteMessage,
} = require('../chatMessage.controller')

const clearDb = require('../../__tests__/_clearDb')

describe('ChatChannel Controller', () => {
  beforeAll(async () => {
    await migrationManager.migrate()
  })

  beforeEach(async () => {
    await clearDb()
  })

  afterAll(async () => {
    db.destroy()
  })

  it('creates a message on a channel', async () => {
    const objectId = uuid()

    const chatChannel = await ChatChannel.insert({
      chatType: 'test',
      relatedObjectId: objectId,
    })

    const { user } = await createChatChannelTeamWithUsers(chatChannel.id)

    await sendMessage(chatChannel.id, 'Hello', user.id)

    const fetchedChatChannel = await ChatChannel.findById(chatChannel.id, {
      related: 'messages',
    })

    expect(fetchedChatChannel.messages).toHaveLength(1)
    expect(fetchedChatChannel.messages[0].content).toEqual('Hello')
  })

  it('edits only a message content on a channel', async () => {
    const objectId = uuid()

    const chatChannel = await ChatChannel.insert({
      chatType: 'test',
      relatedObjectId: objectId,
    })

    const { user } = await createChatChannelTeamWithUsers(chatChannel.id)

    const message = await sendMessage(chatChannel.id, 'Hello', user.id)
    await editMessage(message.id, 'changed')

    const fetchedChatChannel = await ChatChannel.findById(chatChannel.id, {
      related: 'messages',
    })

    expect(fetchedChatChannel.messages).toHaveLength(1)
    expect(fetchedChatChannel.messages[0].content).toEqual('changed')
  })

  it('edits a message content and mentions on a channel', async () => {
    const objectId = uuid()

    const chatChannel = await ChatChannel.insert({
      chatType: 'test',
      relatedObjectId: objectId,
    })

    const { user } = await createChatChannelTeamWithUsers(chatChannel.id)

    const message = await sendMessage(chatChannel.id, 'Hello', user.id)
    await editMessage(message.id, 'changed', [user.id])

    const fetchedChatChannel = await ChatChannel.findById(chatChannel.id, {
      related: 'messages',
    })

    expect(fetchedChatChannel.messages).toHaveLength(1)
    expect(fetchedChatChannel.messages[0].content).toEqual('changed')
    expect(fetchedChatChannel.messages[0].mentions[0]).toEqual(user.id)
  })

  it('deletes a message from a channel', async () => {
    const objectId = uuid()

    const chatChannel = await ChatChannel.insert({
      chatType: 'test',
      relatedObjectId: objectId,
    })

    const { user } = await createChatChannelTeamWithUsers(chatChannel.id)

    const message = await sendMessage(chatChannel.id, 'Hello', user.id)
    await deleteMessage(message.id)

    const fetchedChatChannel = await ChatChannel.findById(chatChannel.id, {
      related: 'messages',
    })

    expect(fetchedChatChannel.messages).toHaveLength(0)
  })
})

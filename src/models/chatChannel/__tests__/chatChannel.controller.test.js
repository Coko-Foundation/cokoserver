const { v4: uuid } = require('uuid')

const { db, migrationManager } = require('../../../db')
const subscriptionManager = require('../../../graphql/pubsub')

const ChatChannel = require('../chatChannel.model')
const { getChatChannels, getChatChannel } = require('../chatChannel.controller')

const clearDb = require('../../_helpers/clearDb')

describe('ChatChannel Controller', () => {
  beforeAll(async () => {
    await migrationManager.migrate()
  })

  beforeEach(() => clearDb())

  afterAll(async () => {
    await db.destroy()
    await subscriptionManager.client.end()
  })

  it('fetches all the available channels', async () => {
    const objectId = uuid()

    const chatChannel1 = await ChatChannel.insert({
      chatType: 'test',
      relatedObjectId: objectId,
    })

    const chatChannel2 = await ChatChannel.insert({
      chatType: 'test',
      relatedObjectId: objectId,
    })

    const { result: chatChannels } = await getChatChannels()
    expect(chatChannels).toHaveLength(2)
    expect(chatChannels[0].id).toEqual(chatChannel1.id)
    expect(chatChannels[1].id).toEqual(chatChannel2.id)
  })

  it('fetches channel based on provided id', async () => {
    const objectId = uuid()

    const chatChannel = await ChatChannel.insert({
      chatType: 'test',
      relatedObjectId: objectId,
    })

    const fetchedChatChannel = await getChatChannel(chatChannel.id)
    expect(fetchedChatChannel).toBeDefined()
  })
})

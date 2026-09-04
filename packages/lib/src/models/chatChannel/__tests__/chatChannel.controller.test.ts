import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { v4 as uuid } from 'uuid'

import { db, migrationManager } from '../../../db'
import subscriptionManager from '../../../graphql/pubsub'

import ChatChannel from '../chatChannel.model'
import { getChatChannels, getChatChannel } from '../chatChannel.controller'

import config from '../../../configManager/config'
import DbTestUtils from '../../../db/DbTestUtils'

describe('ChatChannel Controller', () => {
  beforeAll(async () => {
    config.reset()
    await config.init({
      components: [
        './src/models/user',
        './src/models/identity',
        './src/models/chatMessage',
        './src/models/chatChannel',
      ],
      mailer: false,
    })

    db.init()
    subscriptionManager.init()
    await migrationManager.migrate()
  })

  beforeEach(() => DbTestUtils.clearDb())

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

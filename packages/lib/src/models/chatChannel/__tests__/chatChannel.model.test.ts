import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { v4 as uuid } from 'uuid'

import { db, migrationManager } from '../../../db'
import subscriptionManager from '../../../graphql/pubsub'
import ChatChannel from '../chatChannel.model'
import ChatMessage from '../../chatMessage/chatMessage.model'
import User from '../../user/user.model'
import clearDb from '../../_helpers/clearDb'
import config from '../../../configManager/config'

describe('ChatChannel Model', () => {
  beforeAll(async () => {
    config.reset()
    await config.init({
      components: [
        'src/models/user',
        'src/models/identity',
        'src/models/chatMessage',
        'src/models/chatChannel',
      ],
    })

    await migrationManager.migrate()
  })

  beforeEach(() => clearDb())

  afterAll(async () => {
    await db.destroy()
    await subscriptionManager.client.end()
  })

  it('does not create new channel without a related object id', async () => {
    const createChannel = async (): Promise<ChatChannel> =>
      ChatChannel.insert({
        chatType: 'editors',
      })

    await expect(createChannel()).rejects.toThrow()
  })

  it('can retrieve the channel messages', async () => {
    const relatedObject = uuid()

    const userOne = await User.insert({})
    const userTwo = await User.insert({})
    const userThree = await User.insert({})

    const channel = await ChatChannel.insert({
      chatType: 'editors',
      relatedObjectId: relatedObject,
    })

    const messages = [
      {
        chatChannelId: channel.id,
        userId: userOne.id,
        content: 'this is it',
      },
      {
        chatChannelId: channel.id,
        userId: userTwo.id,
        content: 'is it?',
      },
      {
        chatChannelId: channel.id,
        userId: userThree.id,
        content: 'think so',
      },
    ]

    await ChatMessage.insert(messages)

    const result = await ChatChannel.findById(channel.id, {
      related: 'messages',
    })

    expect(result.messages).toHaveLength(3)
    expect(result.messages[0].userId).toEqual(messages[0].userId)
    expect(result.messages[1].content).toEqual(messages[1].content)
    expect(result.messages[2].chatChannelId).toEqual(messages[2].chatChannelId)
  })
})

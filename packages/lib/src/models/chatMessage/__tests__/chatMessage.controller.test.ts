import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { v4 as uuid } from 'uuid'

import { db, migrationManager } from '../../../db'
import subscriptionManager from '../../../graphql/pubsub'

import ChatChannel from '../../chatChannel/chatChannel.model'

import { createChatChannelTeamWithUsers } from '../../__tests__/helpers/teams'

import {
  sendMessage,
  editMessage,
  deleteMessage,
} from '../chatMessage.controller'

import clearDb from '../../_helpers/clearDb'

describe('ChatChannel Controller', () => {
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

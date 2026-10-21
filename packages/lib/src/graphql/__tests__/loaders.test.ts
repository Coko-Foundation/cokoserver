import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import gql from 'graphql-tag'
import { ApolloServer } from '@apollo/server'

import { db, migrationManager } from '../../db'
import subscriptionManager from '../pubsub'
import createContextFactory from '../context'
import { collectBatchFns } from '../loaders'
import createGraphqlTestServer from '../../utils/createGraphqlTestServer'
import Fake from '../../models/__tests__/helpers/fake/fake.model'
import { createUser } from '../../models/__tests__/helpers/users'

import ChatChannel from '../../models/chatChannel/chatChannel.model'
import ChatMessage from '../../models/chatMessage/chatMessage.model'
import config from '../../configManager/config'
import DbTestUtils from '../../db/DbTestUtils'

const CHANNEL_MESSAGES = gql`
  query ChatChannel($id: ID!) {
    chatChannel(id: $id) {
      id
      messages {
        id
        content
      }
    }
  }
`

describe('GraphQL loaders', async () => {
  let gqlServer: ApolloServer
  let createContext: ReturnType<typeof createContextFactory>

  const fetchChannelMessages = async (
    id: string,
  ): Promise<{ id: string; content: string }[]> => {
    // Each call is a separate request, with its own context
    const response = await gqlServer.executeOperation(
      {
        query: CHANNEL_MESSAGES,
        variables: { id },
      },
      { contextValue: await createContext() },
    )

    if (response.body.kind !== 'single') {
      throw new Error('Expected single result, got incremental')
    }

    expect(response.body.singleResult.errors).toBeUndefined()

    const data = response.body.singleResult.data?.chatChannel as {
      messages: { id: string; content: string }[]
    }

    return data.messages
  }

  beforeAll(async () => {
    config.reset()
    await config.init({
      components: [
        './src/models/user',
        './src/models/identity',
        './src/models/team',
        './src/models/teamMember',
        './src/models/chatMessage',
        './src/models/chatChannel',
        './src/models/__tests__/helpers/fake',
      ],
      mailer: false,
    })

    db.init()
    subscriptionManager.init()
    gqlServer = await createGraphqlTestServer()
    createContext = createContextFactory(await collectBatchFns())
    await migrationManager.migrate()
  })

  beforeEach(async () => {
    await DbTestUtils.clearDb()
  })

  afterAll(async () => {
    await db.destroy()
    await subscriptionManager.client.end()
  })

  it('does not serve stale loader results across requests', async () => {
    const fake = await Fake.insert({})
    const user = await createUser()

    const channel = await ChatChannel.insert({
      chatType: 'test',
      relatedObjectId: fake.id,
    })

    // First request loads (and caches) the channel's messages
    const before = await fetchChannelMessages(channel.id)
    expect(before).toHaveLength(0)

    await ChatMessage.insert({
      chatChannelId: channel.id,
      userId: user.id,
      content: 'hello',
    })

    // A new request should see the new message
    const after = await fetchChannelMessages(channel.id)
    expect(after).toHaveLength(1)
    expect(after[0].content).toBe('hello')
  })
})

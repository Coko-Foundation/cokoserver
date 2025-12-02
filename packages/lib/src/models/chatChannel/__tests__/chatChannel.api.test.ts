import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import gql from 'graphql-tag'
import { ApolloServer } from '@apollo/server'

import { db, migrationManager } from '../../../db'
import subscriptionManager from '../../../graphql/pubsub'
import createGraphqlTestServer from '../../../utils/createGraphqlTestServer'
import Fake from '../../__tests__/helpers/fake/fake.model'

import ChatChannel from '../chatChannel.model'
import { QueryResult } from '../../base.model'
import config from '../../../configManager/config'
import DbTestUtils from '../../../db/DbTestUtils'

describe('Chat channel api', async () => {
  let gqlServer: ApolloServer

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
    })

    gqlServer = await createGraphqlTestServer()
    await migrationManager.migrate()
  })

  beforeEach(async () => {
    await DbTestUtils.clearDb()
  })

  afterAll(async () => {
    await db.destroy()
    await subscriptionManager.client.end()
  })

  it('fetches channels', async () => {
    const fake = await Fake.insert({})

    await ChatChannel.insert([
      {
        chatType: 'test-one',
        relatedObjectId: fake.id,
      },
      {
        chatType: 'test-two',
        relatedObjectId: fake.id,
      },
    ])

    const CHANNELS = gql`
      query {
        chatChannels {
          result {
            id
            chatType
            relatedObjectId
          }
          totalCount
        }
      }
    `

    const response = await gqlServer.executeOperation({
      query: CHANNELS,
    })

    if (response.body.kind !== 'single') {
      throw new Error('Expected single result, got incremental')
    }

    const data = response.body.singleResult.data
      ?.chatChannels as QueryResult<ChatChannel>
    expect(data.totalCount).toBe(2)

    const first = data.result.find(c => c.chatType === 'test-one')
    const second = data.result.find(c => c.chatType === 'test-two')

    expect(first).toBeDefined()
    expect(second).toBeDefined()
  })

  it('filters channel results', async () => {
    const fake = await Fake.insert({})

    await ChatChannel.insert([
      {
        chatType: 'test-one',
        relatedObjectId: fake.id,
      },
      {
        chatType: 'test-two',
        relatedObjectId: fake.id,
      },
    ])

    const CHANNELS = gql`
      query ChatChannels($filter: ChatChannelFilter) {
        chatChannels(filter: $filter) {
          result {
            id
            chatType
            relatedObjectId
          }
          totalCount
        }
      }
    `

    const response = await gqlServer.executeOperation({
      query: CHANNELS,
      variables: {
        filter: { chatType: 'test-one' },
      },
    })

    if (response.body.kind !== 'single') {
      throw new Error('Expected single result, got incremental')
    }

    const data = response.body.singleResult.data
      ?.chatChannels as QueryResult<ChatChannel>
    expect(data.totalCount).toBe(1)
  })
})

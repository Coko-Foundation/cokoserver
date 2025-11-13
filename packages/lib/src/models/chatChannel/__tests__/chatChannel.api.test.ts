import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import gql from 'graphql-tag'

import { db, migrationManager } from '../../../db'
import subscriptionManager from '../../../graphql/pubsub'
import clearDb from '../../_helpers/clearDb'
import createGraphqlTestServer from '../../../utils/createGraphqlTestServer'
import Fake from '../../__tests__/helpers/fake/fake.model'

import ChatChannel from '../chatChannel.model'
import { QueryResult } from '../../base.model'

describe('Chat channel api', async () => {
  const gqlServer = await createGraphqlTestServer()

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

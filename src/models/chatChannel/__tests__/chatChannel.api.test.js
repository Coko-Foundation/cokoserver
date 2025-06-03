const gql = require('graphql-tag')

const { db, migrationManager } = require('../../../db')
const subscriptionManager = require('../../../graphql/pubsub')
const clearDb = require('../../_helpers/clearDb')
const gqlServer = require('../../../utils/createGraphqlTestServer')()
const Fake = require('../../__tests__/helpers/fake/fake.model')

const ChatChannel = require('../chatChannel.model')

describe('Chat channel api', () => {
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

    const data = response.body.singleResult.data.chatChannels
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

    const data = response.body.singleResult.data.chatChannels
    expect(data.totalCount).toBe(1)
  })
})

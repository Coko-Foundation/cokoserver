const gql = require('graphql-tag')

const clearDb = require('../../models/__tests__/_clearDb')
const { db } = require('../../db')
const subscriptionManager = require('../../graphql/pubsub')
const gqlServer = require('../../utils/graphqlTestServer')

describe('GraphQL errors', () => {
  beforeEach(async () => {
    await clearDb()
  })

  afterAll(async () => {
    await db.destroy()
    await subscriptionManager.client.end()
  })

  it('should pass GraphQLError to clients', async () => {
    const QUERY = gql`
      query {
        users {
          invalidProperty
        }
      }
    `

    const response = await gqlServer.executeOperation({
      query: QUERY,
    })

    expect(response.body.singleResult.errors[0].message).toEqual(
      'Cannot query field "invalidProperty" on type "Users".',
    )
  })
})

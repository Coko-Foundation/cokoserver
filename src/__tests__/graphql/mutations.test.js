const gql = require('graphql-tag')

const { User } = require('../../models')
const clearDb = require('../../models/_helpers/clearDb')
const { db } = require('../../db')
const gqlServer = require('../../utils/createGraphqlTestServer')()
const subscriptionManager = require('../../graphql/pubsub')

describe('GraphQL core mutations', () => {
  let user

  const userData = {
    username: 'testuser',
    password: 'password',
  }

  beforeEach(async () => {
    await clearDb()
    user = await User.insert(userData)
  })

  afterAll(async () => {
    await db.destroy()
    await subscriptionManager.client.end()
  })

  describe('mutations', () => {
    it('can update a user', async () => {
      const MUTATION = gql`
        mutation ($id: ID!, $input: UpdateUserInput!) {
          updateUser(id: $id, input: $input) {
            username
          }
        }
      `

      const response = await gqlServer.executeOperation(
        {
          query: MUTATION,
          variables: {
            id: user.id,
            input: { username: 'newUsername' },
          },
        },
        {
          contextValue: {
            userId: user.id,
          },
        },
      )

      const data = response.body.singleResult.data.updateUser
      expect(data.username).toEqual('newUsername')
    })

    it('can delete a user', async () => {
      const MUTATION = gql`
        mutation ($id: ID!) {
          deleteUser(id: $id)
        }
      `

      const response = await gqlServer.executeOperation(
        {
          query: MUTATION,
          variables: {
            id: user.id,
          },
        },
        {
          contextValue: {
            userId: user.id,
          },
        },
      )

      const data = response.body.singleResult.data.deleteUser
      expect(data).toEqual('1')
    })
  })
})

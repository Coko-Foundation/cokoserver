const gql = require('graphql-tag')
const { v4: uuid } = require('uuid')

const clearDb = require('../../models/__tests__/_clearDb')
const { User } = require('../../models')
const { db } = require('../../db')
const gqlServer = require('../../utils/graphqlTestServer')
const subscriptionManager = require('../../graphql/pubsub')

describe('GraphQL authentication', () => {
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

  describe('loginUser mutation', () => {
    it('can log in', async () => {
      const MUTATION = gql`
        mutation ($input: LoginInput!) {
          login(input: $input) {
            user {
              username
            }
            token
          }
        }
      `

      const response = await gqlServer.executeOperation({
        query: MUTATION,
        variables: {
          input: { username: 'testuser', password: 'password' },
        },
      })

      const data = response.body.singleResult.data.login
      expect(data.token).toBeDefined()
      expect(data.user.username).toEqual('testuser')

      expect(true).toBe(true)
    })

    it('blocks invalid login', async () => {
      const MUTATION = gql`
        mutation ($input: LoginInput!) {
          login(input: $input) {
            user {
              username
            }
            token
          }
        }
      `

      const response = await gqlServer.executeOperation({
        query: MUTATION,
        variables: {
          input: { username: 'testuser', password: 'false' },
        },
      })

      const { errors } = response.body.singleResult
      expect(errors[0].message).toEqual(
        'AuthorizationError: Wrong username or password.',
      )
    })
  })

  describe('currentUser query', () => {
    it('returns null when unauthenticated', async () => {
      const QUERY = gql`
        query {
          currentUser {
            username
          }
        }
      `

      const response = await gqlServer.executeOperation({
        query: QUERY,
      })

      const data = response.body.singleResult.data.currentUser
      expect(data).toBe(null)
    })

    it('fetches current user from token', async () => {
      const QUERY = gql`
        query {
          currentUser {
            username
          }
        }
      `

      const response = await gqlServer.executeOperation(
        {
          query: QUERY,
        },
        {
          contextValue: {
            userId: user.id,
          },
        },
      )

      const data = response.body.singleResult.data.currentUser
      expect(data.username).toBe('testuser')
    })

    it('errors when user not found', async () => {
      const QUERY = gql`
        query {
          currentUser {
            username
          }
        }
      `

      const response = await gqlServer.executeOperation(
        {
          query: QUERY,
        },
        {
          contextValue: {
            userId: uuid(),
          },
        },
      )

      const { errors } = response.body.singleResult
      expect(errors[0].message).toBe('NotFoundError')
    })
  })
})

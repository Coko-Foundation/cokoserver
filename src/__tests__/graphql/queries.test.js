const { v4: uuid } = require('uuid')
const gql = require('graphql-tag')

const { Team, User } = require('../../models')
const clearDb = require('../../models/__tests__/_clearDb')
const { db } = require('../../db')
const gqlServer = require('../../utils/graphqlTestServer')
const subscriptionManager = require('../../graphql/pubsub')

describe('GraphQL core queries', () => {
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

  it('can resolve all users', async () => {
    const QUERY = gql`
      query {
        users {
          result {
            username
          }
        }
      }
    `

    const response = await gqlServer.executeOperation({
      query: QUERY,
    })

    const data = response.body.singleResult.data.users
    expect(data.result).toHaveLength(1)
    expect(data.result[0].username).toEqual('testuser')
  })

  it('can resolve user by ID', async () => {
    const QUERY = gql`
      query ($id: ID!) {
        user(id: $id) {
          username
        }
      }
    `

    const response = await gqlServer.executeOperation({
      query: QUERY,
      variables: {
        id: user.id,
      },
    })

    const data = response.body.singleResult.data.user
    expect(data.username).toEqual('testuser')
  })

  it('can resolve a query for a missing object', async () => {
    const QUERY = gql`
      query ($id: ID!) {
        user(id: $id) {
          username
        }
      }
    `

    const response = await gqlServer.executeOperation({
      query: QUERY,
      variables: {
        id: uuid(),
      },
    })

    const { errors } = response.body.singleResult
    expect(errors[0].message).toEqual('NotFoundError')
  })

  it('can resolve nested query', async () => {
    const team = await Team.insert({
      role: 'editor',
      displayName: 'Editor',
      global: true,
    })

    await Team.addMember(team.id, user.id)

    const QUERY = gql`
      query {
        users {
          result {
            username
            teams {
              id
              displayName
              global
            }
          }
        }
      }
    `

    const response = await gqlServer.executeOperation({
      query: QUERY,
    })

    const data = response.body.singleResult.data.users
    expect(data.result).toHaveLength(1)
    const foundUser = data.result[0]
    expect(foundUser.username).toEqual('testuser')
    expect(foundUser.teams).toHaveLength(1)
    const foundTeam = foundUser.teams[0]
    expect(foundTeam.id).toEqual(team.id)
    expect(foundTeam.displayName).toEqual(team.displayName)
    expect(foundTeam.global).toBe(true)
  })
})

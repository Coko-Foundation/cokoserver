import { vi, describe, beforeEach, afterAll, it, expect } from 'vitest'
import { v4 as uuid } from 'uuid'
import gql from 'graphql-tag'

import { Team, User } from '../../models'
import clearDb from '../../models/_helpers/clearDb'
import { db } from '../../db'
import createGraphqlTestServer from '../../utils/createGraphqlTestServer'
import subscriptionManager from '../../graphql/pubsub'

vi.mock('../../configManager/config', async () => {
  const { default: Config } = await import(
    '../../configManager/ConfigConstructor'
  )

  const config = new Config()
  config.init({
    components: [
      './src/models/user',
      './src/models/identity',
      './src/models/team',
      './src/models/teamMember',
    ],
    teams: {
      global: [
        {
          displayName: 'Editor',
          role: 'editor',
        },
      ],
      nonGlobal: [],
    },
  })

  return { default: config }
})

describe('GraphQL core queries', async () => {
  let user
  const gqlServer = await createGraphqlTestServer()

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

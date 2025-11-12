import { describe, beforeEach, it, afterAll, expect, vi } from 'vitest'
import gql from 'graphql-tag'
import { v4 as uuid } from 'uuid'

import clearDb from '../../models/_helpers/clearDb'
import { User } from '../../models'
import { db } from '../../db'
import createGraphqlTestServer from '../../utils/createGraphqlTestServer'
import subscriptionManager from '../../graphql/pubsub'
import { LoginResponse } from '../../models/user/user.controller'

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

describe('GraphQL authentication', async () => {
  let user: User
  const gqlServer = await createGraphqlTestServer()

  const userData = {
    username: 'testuser',
    password: 'password',
  }

  // beforeAll(() => {
  //   vi.resetModules()
  // })

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

      if (response.body.kind !== 'single') {
        throw new Error('Expected single result, got incremental')
      }

      const data = response.body.singleResult?.data?.login as LoginResponse
      expect(data?.token).toBeDefined()
      expect(data?.user.username).toEqual('testuser')

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

      if (response.body.kind !== 'single') {
        throw new Error('Expected single result, got incremental')
      }

      const { errors } = response.body.singleResult

      if (!errors) throw new Error('Expected an error in the reponse')

      expect(errors[0]?.message).toEqual(
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

      if (response.body.kind !== 'single') {
        throw new Error('Expected single result, got incremental')
      }

      const data = response.body.singleResult?.data?.currentUser
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

      if (response.body.kind !== 'single') {
        throw new Error('Expected single result, got incremental')
      }

      const data = response.body.singleResult?.data?.currentUser as User
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

      if (response.body.kind !== 'single') {
        throw new Error('Expected single result, got incremental')
      }

      const { errors } = response.body.singleResult

      if (!errors) throw new Error('No errors found')

      expect(errors[0].message).toBe('NotFoundError')
    })
  })
})

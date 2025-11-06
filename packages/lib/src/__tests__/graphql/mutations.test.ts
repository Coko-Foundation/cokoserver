import { vi, describe, beforeEach, afterAll, it, expect } from 'vitest'

import gql from 'graphql-tag'

import { User } from '../../models'
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
  })

  return { default: config }
})

describe('GraphQL core mutations', async () => {
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

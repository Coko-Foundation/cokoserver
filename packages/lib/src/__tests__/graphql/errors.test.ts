import { vi, describe, it, expect, afterAll, beforeEach } from 'vitest'

import gql from 'graphql-tag'

import clearDb from '../../models/_helpers/clearDb'
import { db } from '../../db'
import subscriptionManager from '../../graphql/pubsub'
import createGraphqlTestServer from '../../utils/createGraphqlTestServer'

vi.mock('../../configManager/config', async () => {
  const { default: Config } = await import(
    '../../configManager/ConfigConstructor'
  )

  const config = new Config()
  config.init({
    components: [
      './packages/lib/src/models/user',
      './packages/lib/src/models/identity',
      './packages/lib/src/models/team',
      './packages/lib/src/models/teamMember',
    ],
  })

  return { default: config }
})

describe('GraphQL errors', async () => {
  const gqlServer = await createGraphqlTestServer()

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

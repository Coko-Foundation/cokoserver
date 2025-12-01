import { vi, describe, it, expect, afterAll, beforeEach } from 'vitest'

import gql from 'graphql-tag'

import { db } from '../../db'
import subscriptionManager from '../../graphql/pubsub'
import createGraphqlTestServer from '../../utils/createGraphqlTestServer'
import DbTestUtils from '../../db/DbTestUtils'

vi.mock('../../configManager/config', async () => {
  const { default: Config } =
    await import('../../configManager/ConfigConstructor')

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

describe('GraphQL errors', async () => {
  const gqlServer = await createGraphqlTestServer()

  beforeEach(async () => {
    await DbTestUtils.clearDb()
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

    if (response.body.kind !== 'single') {
      throw new Error('Expected single result, got incremental')
    }

    if (!response.body.singleResult.errors) {
      throw new Error('Expected errors')
    }

    expect(response.body.singleResult.errors[0].message).toEqual(
      'Cannot query field "invalidProperty" on type "Users".',
    )
  })
})

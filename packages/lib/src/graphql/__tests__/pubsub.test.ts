import { describe, it, afterAll, expect } from 'vitest'
import config from '../../configManager/config'
import GraphQLDisabledError from '../GraphQLDisabledError'
import subscriptionManager from '../pubsub'

describe('Pubsub', () => {
  afterAll(() => {
    config.reset()
  })

  it('captures access to subscription manager when graphql is off', async () => {
    config.reset()

    await config.init({
      useGraphQLServer: false,
      mailer: false,
    })

    subscriptionManager.init()

    expect(() => subscriptionManager.client).toThrow(GraphQLDisabledError)
    expect(() => subscriptionManager.asyncIterator('USER_UPDATED')).toThrow(
      GraphQLDisabledError,
    )
  })

  it('allows access to subscription manager when graphql is on', async () => {
    config.reset()

    await config.init({
      useGraphQLServer: true,
      mailer: false,
    })

    subscriptionManager.init()

    expect(subscriptionManager.client).toBeDefined()
    expect(subscriptionManager.asyncIterator('USER_UPDATED')).toHaveProperty(
      'next',
    )
  })
})

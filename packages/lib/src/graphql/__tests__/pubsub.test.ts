import { describe, it, beforeEach, afterAll, expect } from 'vitest'
import config from '../../configManager/config'
import GraphQLDisabledError from '../GraphQLDisabledError'
import subscriptionManager from '../pubsub'

describe('Pubsub', () => {
  beforeEach(() => {
    config.reset()
  })

  afterAll(() => {
    config.reset()
  })

  it('captures access to subscription manager when graphql is off', async () => {
    await config.init({
      useGraphQLServer: false,
    })

    expect(() => subscriptionManager.client).toThrow(GraphQLDisabledError)
    expect(() => subscriptionManager.asyncIterator('USER_UPDATED')).toThrow(
      GraphQLDisabledError,
    )
  })

  it('allows access to subscription manager when graphql is on', async () => {
    await config.init({
      useGraphQLServer: true,
    })

    expect(subscriptionManager.client).toBeDefined()
    expect(subscriptionManager.asyncIterator('USER_UPDATED')).toHaveProperty(
      'next',
    )
  })
})

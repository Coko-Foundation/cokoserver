const subscriptionManager = require('../../graphql/pubsub')

describe('pubsub manager', () => {
  afterEach(() => subscriptionManager.client.end())

  it('can call destroy before connect', () =>
    expect(subscriptionManager.client.end()).resolves.toBeUndefined())

  it('waits for client to drain before closing', async () => {
    const cb = jest.fn()
    subscriptionManager.subscribe('test_channel', cb)
    subscriptionManager.publish('test_channel', { test: 'content' })

    expect(cb).not.toHaveBeenCalled()

    await subscriptionManager.client.end()
    expect(cb).toHaveBeenCalledWith({ test: 'content' })
  })
})

/* eslint-disable global-require, jest/no-disabled-tests */

/**
 * Nested requires because the tests are skipped, so the after all is never
 * run to clean up hanging connections.
 */

describe('ChatGPT', () => {
  afterAll(async () => {
    const { db } = require('../../db')
    const subscriptionManager = require('../../graphql/pubsub')

    await db.destroy()
    await subscriptionManager.client.end()
  })

  /**
   * Keep disabled by default, as these tests connect to an external api that
   * might be down, causing pipelines to fail through no fault of our own.
   */

  it.skip('returns text given a prompt', async () => {
    const chatGPT = require('../chatGPT/chatGPT.controllers')

    // config.get.mockReturnValue(process.env.CHAT_GPT_KEY)
    const result = await chatGPT('what is the coko foundation')
    console.log(result) // eslint-disable-line no-console
    expect(result).toBeTruthy()
  }, 20000)

  it.skip('uses the graphql resolver to call the openai api', async () => {
    const gqlServer = require('../../utils/createGraphqlTestServer')()

    const CHAT_GPT = `
      query chatGPT ($input: String!) {
        chatGPT (input: $input)
      }
    `

    const result = await gqlServer.executeOperation({
      query: CHAT_GPT,
      variables: {
        input: 'what is the coko foundation',
      },
    })

    const data = result.body.singleResponse.data.chatGPT
    expect(data).toBeTruthy()
  }, 20000)
})

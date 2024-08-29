const { StatusCodes } = require('http-status-codes')
const express = require('express')
const supertest = require('supertest')
const gql = require('graphql-tag')

const { db } = require('../db')
const registerComponents = require('../startup/registerComponents')
const gqlServer = require('../utils/createGraphqlTestServer')()

jest.mock('config', () => {
  /* eslint-disable-next-line global-require */
  const TestConfig = require('../utils/TestConfig')

  return new TestConfig(
    {
      components: ['src/__tests__/helpers/mockComponent.js'],
    },
    { useDb: true },
  )
})

describe('App startup', () => {
  const app = express()
  const request = supertest(app)

  beforeAll(async () => {
    registerComponents(app)
  })

  afterAll(async () => {
    await db.destroy()
  })

  it('should register components on config.components', async () => {
    const res = await request.get('/mock-component')
    expect(res.status).toBe(StatusCodes.OK)
  })

  it('loads graphql types and resolvers', async () => {
    const QUERY = gql`
      query {
        test
      }
    `

    const response = await gqlServer.executeOperation({
      query: QUERY,
    })

    const data = response.body.singleResult.data.test
    expect(data).toBe('OK')
  })
})

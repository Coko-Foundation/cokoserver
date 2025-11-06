import { StatusCodes } from 'http-status-codes'
import express from 'express'
import supertest from 'supertest'
import gql from 'graphql-tag'
// import { GraphQLResponse } from '@apollo/server'
import { vi, describe, beforeAll, afterAll, expect, it } from 'vitest'

import { db } from '../db'
import registerComponents from '../startup/registerComponents'
import createGraphqlTestServer from '../utils/createGraphqlTestServer'

vi.mock('../configManager/config', async () => {
  const { default: Config } = await import('../configManager/ConfigConstructor')

  const config = new Config()
  config.init({
    components: ['./packages/lib/src/__tests__/helpers/mockComponent.ts'],
  })

  return { default: config }
})

describe('App startup', () => {
  const app = express()
  const request = supertest(app)

  beforeAll(async () => {
    await registerComponents(app)
  })

  afterAll(async () => {
    await db.destroy()
  })

  it('should register components on config.components', async () => {
    // @ts-ignore
    const res = await request.get('/mock-component')
    expect(res.status).toBe(StatusCodes.OK)
  })

  it('loads graphql types and resolvers', async () => {
    const QUERY = gql`
      query {
        test
      }
    `

    const gqlServer = await createGraphqlTestServer()
    const response = await gqlServer.executeOperation({
      query: QUERY,
    })

    if (response.body.kind !== 'single') {
      throw new Error('Expected single result, got incremental')
    }

    const data = response.body.singleResult?.data?.test
    expect(data).toBe('OK')
  })
})

const axios = require('axios')
const config = require('config')
const { URLSearchParams: UnpackedParams } = require('url')
const find = require('lodash/find')
const flattenDeep = require('lodash/flattenDeep')

const {
  createOAuthIdentity,
  invalidateProviderAccessToken,
  invalidateProviderTokens,
} = require('../identity.controller')

const { User, Identity } = require('../../index')
const { jobManager } = require('../../../jobManager')
const { foreverDate } = require('../../../utils/time')

const { createUser } = require('../../__tests__/helpers/users')
const clearDb = require('../../__tests__/_clearDb')

// Mock "refresh token expired job"
// jest.mock('../../services', () => {
//   const { jobs: jobs_, ...originalModule } =
//     jest.requireActual('../../services')

//   return {
//     __esModule: true,
//     ...originalModule,
//     jobs: {
//       ...jobs_,
//       defer: jest.fn(async (name, startAfter, data) => [
//         name,
//         startAfter,
//         data,
//       ]),
//     },
//   }
// })

const fakeAccessToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJkZWZhdWx0QHRlc3QuY29tIiwiZmFtaWx5X25hbWUiOiJXYWx0b24iLCJnaXZlbl9uYW1lIjoiSm9obiJ9.8Qn2H6FAJVUn6T1U7bnbjnuguIFlY5EW_XaII1IJdE4'

const fakePostResponse = ({ method, url, data, headers }) => {
  const dataUnpacked = new UnpackedParams(data)

  if (headers['Content-Type'] !== 'application/x-www-form-urlencoded') {
    return {
      status: 415,
      data: {
        msg: 'Unsupported Media Type',
      },
    }
  }

  if (method !== 'POST') {
    return {
      status: 405,
      data: {
        msg: 'Method Not Allowed',
      },
    }
  }

  if (url !== config.integrations.test.tokenUrl) {
    return {}
  }

  if (dataUnpacked.get('client_id') !== config.integrations.test.clientId) {
    return {
      status: 400,
      data: {
        error: 'invalid_client',
        error_description: 'Invalid client credentials',
      },
    }
  }

  if (dataUnpacked.get('grant_type') !== 'authorization_code') {
    return {
      status: 400,
      data: {
        error: 'unsupported_grant_type',
        error_description: 'Unsupported grant_type',
      },
    }
  }

  if (dataUnpacked.get('code') !== 'fake-code') {
    return {
      status: 400,
      data: { error: 'invalid_grant', error_description: 'Code not valid' },
    }
  }

  return {
    status: 200,
    data: {
      access_token: fakeAccessToken,
      expires_in: 3600,
      'not-before-policy': 0,
      refresh_expires_in: 360000,
      refresh_token: 'fake.refresh.token',
      scope: '',
      session_state: 'fake-session-state',
      token_type: 'Bearer',
    },
  }
}

const timeLeft = dateTime => {
  return new Date(dateTime) - new Date()
}

jest.mock('axios')
const specificDate = new Date()
Date.now = jest.fn(() => specificDate)

describe('Identity Controller', () => {
  beforeEach(() => clearDb())

  afterAll(() => {
    const knex = User.knex()
    knex.destroy()
  })

  it('authorizes access and inserts the Oauth tokens', async () => {
    axios.mockImplementationOnce(fakePostResponse)
    const user = await createUser()
    // Mock authorization
    await createOAuthIdentity(
      user.id,
      'test',
      'fake-session-state',
      'fake-code',
    )

    // Validate provider auth tokens
    const newProvider = await Identity.findOne({
      userId: user.id,
      provider: 'test',
    })

    expect(newProvider.email).toEqual('default@test.com')
    expect(newProvider.oauthAccessToken).toEqual(fakeAccessToken)
    // Expect time left to be 3600s (with 5s uncertainty)
    expect(
      timeLeft(newProvider.oauthAccessTokenExpiration) <= 3600000,
    ).toBeTruthy()
    expect(
      timeLeft(newProvider.oauthAccessTokenExpiration) >= 3595000,
    ).toBeTruthy()
    expect(newProvider.oauthRefreshToken).toEqual('fake.refresh.token')
    // Expect time left to be 3600000 (with 5s uncertainty)
    expect(
      timeLeft(newProvider.oauthRefreshTokenExpiration) <= 360000000,
    ).toBeTruthy()
    expect(
      timeLeft(newProvider.oauthRefreshTokenExpiration) >= 359995000,
    ).toBeTruthy()
    // Expect renewal job to have been "scheduled"
    const lastCallIndex = jobManager.sendToQueue.mock.calls.length - 1

    const [name, renewAfter, data] =
      jobManager.sendToQueue.mock.calls[lastCallIndex]

    expect(name).toEqual('refresh-token-expired')
    expect({ seconds: Math.round(renewAfter.seconds) }).toEqual({
      seconds: 360000,
    }) // 360000 - 86400
    expect(data).toEqual({ providerLabel: 'test', userId: user.id })
  })

  it('invalidates access token', async () => {
    axios.mockImplementationOnce(fakePostResponse)
    const user = await createUser()
    // Mock authorization
    await createOAuthIdentity(
      user.id,
      'test',
      'fake-session-state',
      'fake-code',
    )
    await invalidateProviderAccessToken(user.id, 'test')

    const { oauthAccessTokenExpiration } = await Identity.findOne({
      userId: user.id,
      provider: 'test',
    })

    expect(oauthAccessTokenExpiration).toEqual(specificDate)
  })

  it('invalidates provider tokens', async () => {
    axios.mockImplementationOnce(fakePostResponse)
    const user = await createUser()
    // Mock authorization
    await createOAuthIdentity(
      user.id,
      'test',
      'fake-session-state',
      'fake-code',
    )
    await invalidateProviderTokens(user.id, 'test')

    const { oauthAccessTokenExpiration, oauthRefreshTokenExpiration } =
      await Identity.findOne({
        userId: user.id,
        provider: 'test',
      })

    expect(oauthAccessTokenExpiration).toEqual(specificDate)
    expect(oauthRefreshTokenExpiration).toEqual(specificDate)
  })

  it('authorizes access and inserts the Oauth tokens with never-expiring refresh token and not schedule a expiration job', async () => {
    axios.mockResolvedValueOnce({
      status: 200,
      data: {
        access_token: fakeAccessToken,
        expires_in: 3600,
        'not-before-policy': 0,
        refresh_expires_in: 0,
        refresh_token: 'fake.refresh.token',
        scope: '',
        session_state: 'fake-session-state',
        token_type: 'Bearer',
      },
    })
    const user = await createUser()
    // Mock authorization
    await createOAuthIdentity(
      user.id,
      'test',
      'fake-session-state',
      'fake-code',
    )

    const { oauthRefreshTokenExpiration } = await Identity.findOne({
      userId: user.id,
      provider: 'test',
    })

    expect(oauthRefreshTokenExpiration).toEqual(foreverDate)
    expect(
      find(flattenDeep(jobManager.sendToQueue.mock.calls), { userId: user.id }),
    ).toBeUndefined()
  })
})

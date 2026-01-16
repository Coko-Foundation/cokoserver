import {
  describe,
  beforeAll,
  beforeEach,
  afterAll,
  it,
  expect,
  vi,
} from 'vitest'

import axios from 'axios'
import { URLSearchParams as UnpackedParams } from 'url'
import flattenDeep from 'lodash/flattenDeep'

import {
  createOAuthIdentity,
  invalidateProviderAccessToken,
  invalidateProviderTokens,
} from '../identity.controller'

import config from '../../../configManager/config'
import { db, migrationManager } from '../../../db'
import subscriptionManager from '../../../graphql/pubsub'
import { jobManager } from '../../../jobManager'
import { foreverDate } from '../../../utils/time'

import Identity from '../identity.model'

import { createUser } from '../../__tests__/helpers/users'
import DbTestUtils from '../../../db/DbTestUtils'

vi.mock('../../../jobManager', () => {
  return {
    jobManager: {
      sendToQueue: vi.fn(),
    },
    defaultJobQueueNames: {
      REFRESH_TOKEN_EXPIRED: 'refresh-token-expired',
    },
  }
})

const fakeAccessToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJkZWZhdWx0QHRlc3QuY29tIiwiZmFtaWx5X25hbWUiOiJXYWx0b24iLCJnaXZlbl9uYW1lIjoiSm9obiJ9.8Qn2H6FAJVUn6T1U7bnbjnuguIFlY5EW_XaII1IJdE4'

type FakeResponseArgs = {
  method: string
  url: string
  data: any
  headers: Record<string, string>
}

type FakeResponse = {
  status?: number
  data?: {
    access_token?: string
    error?: string
    error_description?: string
    expires_in?: number
    msg?: string
    'not-before-policy'?: number
    refresh_expires_in?: number
    refresh_token?: string
    scope?: string
    session_state?: string
    token_type?: string
  }
}

const fakePostResponse = ({
  method,
  url,
  data,
  headers,
}: FakeResponseArgs): FakeResponse => {
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

  const integration = config.get('integrations').find(i => i.name === 'test')

  if (url !== integration.tokenUrl) {
    return {}
  }

  if (dataUnpacked.get('client_id') !== integration.clientId) {
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

const timeLeft = (dateTime: Date): number => {
  return new Date(dateTime).getTime() - new Date().getTime()
}

vi.mock('axios')
const specificDate = new Date()

describe('Identity Controller', () => {
  beforeAll(async () => {
    config.reset()
    await config.init({
      components: ['./src/models/user', './src/models/identity'],
      integrations: [
        {
          name: 'test',
          clientId: 'the-client-id',
          redirectUri: 'http://localhost:4000/provider-redirect',
          tokenUrl: 'https://api.myprovider.com/auth',
        },
      ],
      mailer: false,
    })

    db.init()
    subscriptionManager.init()
    await migrationManager.migrate()

    vi.useFakeTimers()
    vi.setSystemTime(specificDate)
  })

  beforeEach(async () => {
    await DbTestUtils.clearDb()
  })

  afterAll(async () => {
    config.reset()
    await db.destroy()
    await subscriptionManager.client.end()
    vi.useRealTimers()
  })

  it('authorizes access and inserts the Oauth tokens', async () => {
    ;(axios as any).mockImplementationOnce(fakePostResponse)
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
    // // Expect time left to be 3600s (with 5s uncertainty)
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

    expect(jobManager.sendToQueue).toHaveBeenCalledTimes(1)
    expect(jobManager.sendToQueue).toHaveBeenCalledWith(
      'refresh-token-expired',
      {
        providerLabel: 'test',
        userId: user.id,
      },
      {
        startAfter: 360000,
      },
    )
  })

  it('invalidates access token', async () => {
    ;(axios as any).mockImplementationOnce(fakePostResponse)
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
    ;(axios as any).mockImplementationOnce(fakePostResponse)
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
    ;(axios as any).mockResolvedValueOnce({
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
      flattenDeep((jobManager.sendToQueue as any).mock.calls).find(
        (i: any) => i.userId === user.id,
      ),
    ).toBeUndefined()
  })
})

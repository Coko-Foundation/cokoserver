const axios = require('axios')
const { authenticatedCall } = require('../authenticatedCall')

jest.mock('../tokens', () => {
  return {
    getAuthTokens: jest.fn(() => 'token'),
  }
})

jest.mock('../../models/identity/identity.controller.js', () => {
  return {
    invalidateProviderAccessToken: jest.fn(),
  }
})

const {
  invalidateProviderAccessToken,
} = require('../../models/identity/identity.controller')

const { getAuthTokens } = require('../tokens')

jest.mock('axios')

describe('Authenticated call', () => {
  it('calls provider with auth', async () => {
    axios.mockResolvedValue(true)
    const res = await authenticatedCall('123', 'lulu', {})
    expect(res).toBe(true)
  })

  it('fetches a new token when expired', async () => {
    axios.mockResolvedValueOnce({ status: 401 }).mockResolvedValue(true)

    const res = await authenticatedCall('123', 'lulu', {})
    expect(invalidateProviderAccessToken).toHaveBeenCalled()
    expect(getAuthTokens).toHaveBeenCalled()
    expect(res).toBe(true)
  })
})

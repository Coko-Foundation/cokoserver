import { describe, it, expect, vi } from 'vitest'
import axios from 'axios'
import { authenticatedCall } from '../authenticatedCall'
import { invalidateProviderAccessToken } from '../../models/identity/identity.controller'
import { getAuthTokens } from '../tokens'

vi.mock('../tokens', () => {
  return {
    getAuthTokens: vi.fn(() => 'token'),
  }
})

vi.mock('../../models/identity/identity.controller.js', () => {
  return {
    invalidateProviderAccessToken: vi.fn(),
  }
})

vi.mock('axios')

describe('Authenticated call', () => {
  it('calls provider with auth', async () => {
    // @ts-ignore
    axios.mockResolvedValue(true)
    const res = await authenticatedCall('123', 'lulu', {})
    expect(res).toBe(true)
  })

  it('fetches a new token when expired', async () => {
    // @ts-ignore
    axios.mockResolvedValueOnce({ status: 401 }).mockResolvedValue(true)

    const res = await authenticatedCall('123', 'lulu', {})
    expect(invalidateProviderAccessToken).toHaveBeenCalled()
    expect(getAuthTokens).toHaveBeenCalled()
    expect(res).toBe(true)
  })
})

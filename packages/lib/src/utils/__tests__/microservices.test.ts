import { describe, it, expect, vi } from 'vitest'
import axios from 'axios'

import { callMicroservice } from '../microservices'

vi.mock('../tokens', () => {
  return {
    getAccessToken: vi.fn(() => 'token'),
  }
})

vi.mock('axios')

describe('Microservices', () => {
  it('calls microservice successfully with token', async () => {
    // @ts-ignore
    axios.mockResolvedValue(true)
    const res = await callMicroservice('xsweet', {})
    expect(res).toBe(true)
  })

  it('fetches a new token when expired', async () => {
    axios
      // @ts-ignore
      .mockRejectedValueOnce({
        response: {
          status: 401,
          data: {
            msg: 'expired token',
          },
        },
      })
      .mockResolvedValueOnce(true)

    const res = await callMicroservice('xsweet', {})
    expect(res).toBe(true)
  })
})

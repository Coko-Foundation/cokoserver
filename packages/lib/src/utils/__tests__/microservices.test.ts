import { describe, it, expect } from 'vitest'
import axios from 'axios'

import { callMicroservice } from '../microservices'

jest.mock('../tokens', () => {
  return {
    getAccessToken: jest.fn(() => 'token'),
  }
})

jest.mock('axios')

describe('Microservices', () => {
  it('calls microservice successfully with token', async () => {
    axios.mockResolvedValue(true)
    const res = await callMicroservice('xsweet', {})
    expect(res).toBe(true)
  })

  it('fetches a new token when expired', async () => {
    axios
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

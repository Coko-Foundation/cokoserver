import { vi, describe, afterAll, it, expect } from 'vitest'

import config from '../configManager/config'
import authentication from '../authentication'

describe('token management', () => {
  afterAll(() => {
    config.reset()
  })

  it('creates and verifies a token', async () => {
    const {
      token: { create: createToken, verify: verifyToken },
    } = authentication
    const token = createToken({ id: 1, username: 'test' })

    const callback = (err, _id, user): void => {
      if (err) throw new Error()
      expect(user.token).toEqual(token)
    }

    verifyToken(token, callback)
  })

  it('does not verify an expired token', async () => {
    const {
      token: { create: createToken, verify: verifyToken },
    } = authentication
    const token = createToken({ id: 1, username: 'test' })

    const callback = (err, id, user): void => {
      if (err) {
        throw new Error()
      }

      expect(user).not.toBeDefined()
    }

    const futureTime = new Date(new Date().getTime() + 24 * 3600 * 1000) // in 24H
    vi.useFakeTimers()
    vi.setSystemTime(futureTime)
    verifyToken(token, callback)
    vi.useRealTimers()
  })

  it('accepts a configuration option for expiry', async () => {
    config.reset()
    await config.init({
      tokenExpiresIn: 48 * 3600,
    })

    const {
      token: { create: createToken, verify: verifyToken },
    } = authentication

    const token = createToken({ id: 1, username: 'test' })

    const tokenValidCallback = (err, id, user): void => {
      if (err) throw new Error()
      expect(user.token).toEqual(token)
    }

    const tokenErrorCallback = (err, id, user): void => {
      if (err) throw new Error()
      expect(user).not.toBeDefined()
    }

    // in 36H, more than the default expiry, less than the one in config
    const futureTime = new Date(new Date().getTime() + 36 * 3600 * 1000)
    vi.useFakeTimers()
    vi.setSystemTime(futureTime)
    verifyToken(token, tokenValidCallback) // valid
    vi.useRealTimers()

    // in 48H, after it's expired
    const anotherFutureTime = new Date(new Date().getTime() + 48 * 3600 * 1000)
    vi.useFakeTimers()
    vi.setSystemTime(anotherFutureTime)
    verifyToken(token, tokenErrorCallback) // expired
    vi.useRealTimers()
  })
})

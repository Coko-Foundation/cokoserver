import { vi, describe, beforeEach, it, expect } from 'vitest'

describe('token management', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('creates and verifies a token', async () => {
    const { default: authentication } = await import('../authentication')
    const {
      token: { create: createToken, verify: verifyToken },
    } = authentication
    const token = createToken({ id: 1, username: 'test' })

    const callback = (err, id, user): void => {
      if (err) {
        throw new Error()
      }

      expect(user.token).toEqual(token)
    }

    verifyToken(token, callback)
  })

  it('does not verify an expired token', async () => {
    const { default: authentication } = await import('../authentication')
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
    vi.doMock('../configManager/config', async () => {
      const { default: Config } = await import(
        '../configManager/ConfigConstructor'
      )

      const config = new Config()
      config.init({
        tokenExpiresIn: 48 * 3600,
      })

      return { default: config }
    })

    const { default: authentication } = await import('../authentication')
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

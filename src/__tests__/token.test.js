/* eslint-disable global-require */

describe('token management', () => {
  it('creates and verifies a token', () => {
    const {
      token: { create: createToken, verify: verifyToken },
    } = require('../authentication')

    const token = createToken({ id: 1, username: 'test' })

    const callback = (err, id, user) => {
      if (err) {
        throw new Error()
      }

      expect(user.token).toEqual(token)
    }

    verifyToken(token, callback)
  })

  it('does not verify an expired token', () => {
    const {
      token: { create: createToken, verify: verifyToken },
    } = require('../authentication')

    const token = createToken({ id: 1, username: 'test' })

    const callback = (err, id, user) => {
      if (err) {
        throw new Error()
      }

      expect(user).toEqual(undefined)
    }

    // Mock a Date now in 24 hours, the default expiry
    const now = new Date(new Date().getTime() + 24 * 3600 * 1000)
    const realDate = Date.now
    Date.now = jest.fn().mockReturnValue(now)
    verifyToken(token, callback)
    Date.now = realDate
  })

  it('accepts a configuration option for expiry', () => {
    // Resetting modules to reload with the new config
    jest.resetModules()

    process.env.NODE_CONFIG = `{"tokenExpiresIn":"2 days"}`

    const {
      token: { create: createToken, verify: verifyToken },
    } = require('../authentication')

    const token = createToken({ id: 1, username: 'test' })

    const tokenValidCallback = (err, id, user) => {
      if (err) throw new Error()
      expect(user.token).toEqual(token)
    }

    const realDate = Date.now
    // Mock a Date now in 36 hours, more than the default expiry
    let now = new Date(new Date().getTime() + 36 * 3600 * 1000)
    Date.now = jest.fn().mockReturnValue(now)

    // Token should still be valid
    verifyToken(token, tokenValidCallback)

    // Mock a Date now in 48 hours, the configured expiry
    now = new Date(new Date().getTime() + 48 * 3600 * 1000)
    Date.now = jest.fn().mockReturnValue(now)

    const tokenErrorCallback = (err, id, user) => {
      if (err) throw new Error()
      expect(user).toEqual(undefined)
    }

    // Token should be expired
    verifyToken(token, tokenErrorCallback)
    Date.now = realDate
  })
})

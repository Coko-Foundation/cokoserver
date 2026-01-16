import {
  vi,
  describe,
  beforeAll,
  beforeEach,
  afterAll,
  it,
  expect,
} from 'vitest'

import db from '../db/db'
import config from '../configManager/config'
import authentication from '../authentication'
import User from '../models/user/user.model'
import DbTestUtils from '../db/DbTestUtils'

describe('token management', () => {
  beforeAll(async () => {
    await config.init({ mailer: false })
    db.init()
  })

  beforeEach(async () => {
    await DbTestUtils.clearDb()
  })

  afterAll(() => {
    config.reset()
  })

  it('creates and verifies a token', async () => {
    const {
      token: { create: createToken, verify: verifyToken },
    } = authentication

    const u = await User.insert({ username: 'test' })
    const token = createToken(u)

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

    const u = await User.insert({ username: 'test' })
    const token = createToken(u)

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
      mailer: false,
      tokenExpiresIn: 48 * 3600,
    })

    const {
      token: { create: createToken, verify: verifyToken },
    } = authentication

    const u = await User.insert({ username: 'test' })
    const token = createToken(u)

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

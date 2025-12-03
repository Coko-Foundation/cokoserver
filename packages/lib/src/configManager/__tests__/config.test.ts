import { describe, it, expect } from 'vitest'

import Config from '../ConfigConstructor'
import { ConfigUnknownPropertyError } from '../errors'

describe('Config', () => {
  it('does not allow custom properties outside of values', async () => {
    const config = new Config()
    await config.init()

    expect(() => {
      // @ts-ignore
      config.secret = 'hello'
    }).toThrow()
  })

  it('reads a value', async () => {
    const config = new Config()
    await config.init()
    expect(config.get('useGraphQLServer')).toBe(true)
  })

  it('checks if a value exists', async () => {
    const config = new Config()
    await config.init()
    expect(config.has('randomValue')).toBe(false)
  })

  it('accepts override values on init', async () => {
    const config = new Config()
    await config.init({ secret: 'secretTest' })
    expect(config.get('secret')).toBe('secretTest')
  })

  it('throws an error if an unknown property is requested', async () => {
    const config = new Config()
    await config.init({
      sentry: false,
    })

    expect(config.get('sentry')).toBe(false)

    expect(config.has('unknown')).toBe(false)
    expect(() => config.get('unknown')).toThrow(ConfigUnknownPropertyError)
  })
})

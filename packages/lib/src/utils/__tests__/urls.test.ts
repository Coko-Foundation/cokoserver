import { describe, it, expect } from 'vitest'
import config from '../../configManager/config'
import { sanitizeUrlByConfigKey } from '../urls'

jest.mock('config')

describe('URL utils', () => {
  describe('Sanitize URL by config key', () => {
    it('is unaffected when it has no trailing slashes', async () => {
      config.has.mockReturnValueOnce(true)
      config.get.mockReturnValueOnce('http://localhost:4000')

      const result = sanitizeUrlByConfigKey('test')
      expect(result).toBe('http://localhost:4000')
    })

    it('removes trailing slash if there is one', async () => {
      config.has.mockReturnValueOnce(true)
      config.get.mockReturnValueOnce('http://localhost:4000/')

      const result = sanitizeUrlByConfigKey('test')
      expect(result).toBe('http://localhost:4000')
    })

    it('removes trailing slashes if there are many', async () => {
      config.has.mockReturnValueOnce(true)
      config.get.mockReturnValueOnce('http://localhost:4000////')

      const result = sanitizeUrlByConfigKey('test')
      expect(result).toBe('http://localhost:4000')
    })

    it('returns null if the key is not in the config', async () => {
      config.has.mockReturnValueOnce(false)

      const result = sanitizeUrlByConfigKey('test')
      expect(result).toBe(null)
    })
  })
})

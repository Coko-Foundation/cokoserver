import { describe, it, expect, beforeEach } from 'vitest'
import config from '../../configManager/config'
import { sanitizeUrlByConfigKey } from '../urls'

describe('URL utils', () => {
  describe('Sanitize URL by config key', () => {
    beforeEach(() => {
      config.reset()
    })

    it('is unaffected when it has no trailing slashes', async () => {
      await config.init({
        clientUrl: 'http://localhost:4000',
      })

      const result = sanitizeUrlByConfigKey('clientUrl')
      expect(result).toBe('http://localhost:4000')
    })

    it('removes trailing slash if there is one', async () => {
      await config.init({
        clientUrl: 'http://localhost:4000/',
      })

      const result = sanitizeUrlByConfigKey('clientUrl')
      expect(result).toBe('http://localhost:4000')
    })

    it('removes trailing slashes if there are many', async () => {
      await config.init({
        clientUrl: 'http://localhost:4000////',
      })

      const result = sanitizeUrlByConfigKey('clientUrl')
      expect(result).toBe('http://localhost:4000')
    })

    it('returns null if the key is not in the config', async () => {
      await config.init({
        // @ts-ignore
        clientUrl: null,
      })

      // clientUrl does not exist
      const result = sanitizeUrlByConfigKey('clientUrl')
      expect(result).toBe(null)
    })
  })
})

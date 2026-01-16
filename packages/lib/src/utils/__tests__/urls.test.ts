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
        mailer: false,
      })

      const result = sanitizeUrlByConfigKey('clientUrl')
      expect(result).toBe('http://localhost:4000')
    })

    it('removes trailing slash if there is one', async () => {
      await config.init({
        clientUrl: 'http://localhost:4000/',
        mailer: false,
      })

      const result = sanitizeUrlByConfigKey('clientUrl')
      expect(result).toBe('http://localhost:4000')
    })

    it('removes trailing slashes if there are many', async () => {
      await config.init({
        clientUrl: 'http://localhost:4000////',
        mailer: false,
      })

      const result = sanitizeUrlByConfigKey('clientUrl')
      expect(result).toBe('http://localhost:4000')
    })
  })
})

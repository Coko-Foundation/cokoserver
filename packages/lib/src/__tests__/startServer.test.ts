import { describe, it, expect } from 'vitest'
import { startServer, shutdownFn } from '../startServer'

describe('Starting the server', () => {
  describe('Function exported by src/index.js', () => {
    it('starts the server and returns it with express app attached', async () => {
      const server = await startServer({
        mailer: false,
        components: [
          './src/models/user',
          './src/models/identity',
          './src/models/teamMember',
          './src/models/team',
        ],
      })

      expect(server.listening).toBe(true)
      // expect(server).toHaveProperty('app')
      await shutdownFn()
    })

    it.skip('returns the server if it is already running', async () => {
      // const server = await startServer()
      // server.originalServer = true
      const secondAccess = await startServer()
      expect(secondAccess).toHaveProperty('originalServer')
      await shutdownFn()
    })
  })
})

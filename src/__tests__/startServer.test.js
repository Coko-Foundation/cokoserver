const path = require('path')
const supertest = require('supertest')

describe('Starting the server', () => {
  describe('Function exported by src/index.js', () => {
    process.env.NODE_CONFIG = '{"port":4001}'
    /* eslint-disable-next-line global-require */
    const startServer = require('../startServer')

    /* eslint-disable-next-line jest/no-done-callback */
    it('starts the server and returns it with express app attached', async done => {
      const server = await startServer()
      expect(server.listening).toBe(true)
      expect(server).toHaveProperty('app')
      server.close(done)
    })

    /* eslint-disable-next-line jest/no-done-callback */
    it('returns the server if it is already running', async done => {
      const server = await startServer()
      server.originalServer = true
      const secondAccess = await startServer()
      expect(secondAccess).toHaveProperty('originalServer')
      server.close(done)
    })
  })

  describe('Custom server app entrypoint', () => {
    beforeEach(() => {
      jest.resetModules()
    })

    it('fails if file does not exist', async () => {
      process.env.NODE_CONFIG = JSON.stringify({
        port: 4001,
        app: 'some/file/that/does/not/exist.js',
      })
      /* eslint-disable-next-line global-require */
      const startServer = require('../startServer')
      await expect(startServer()).rejects.toThrow(
        'Cannot load app from provided path!',
      )
    })

    /* eslint-disable-next-line jest/no-done-callback */
    it('starts the app using the custom file', async done => {
      process.env.NODE_CONFIG = JSON.stringify({
        port: 4001,
        app: path.resolve(__dirname, 'helpers', 'customApp.js'),
      })

      /* eslint-disable-next-line global-require */
      const startServer = require('../startServer')
      const server = await startServer()
      const request = supertest(server.app)
      const verify = await request.get('/verify')
      expect(verify.status).toBe(200)
      expect(verify.text).toBe('hi')
      const index = await request.get('/')
      expect(index.status).toBe(404)
      server.close(done)
    })

    /* eslint-disable-next-line jest/no-done-callback */
    it('starts the app using a custom file at ./server/app.js', async done => {
      process.env.NODE_CONFIG = JSON.stringify({
        port: 4001,
      })
      process.env.NODE_CONFIG_STRICT_MODE = false
      // Change directory to test/helpers, to reflect the env of an actual app
      // so that we can load packages/server/test/helpers/server/app.js
      const cwd = process.cwd()
      process.chdir(path.join(__dirname, 'helpers', 'mockServer'))
      /* eslint-disable-next-line global-require */
      const startServer = require('../startServer')
      const server = await startServer()
      const request = supertest(server.app)
      const verify = await request.get('/verify')
      expect(verify.status).toBe(200)
      process.chdir(cwd)
      server.close(done)
    })
  })
})

/* eslint-disable no-console */

import path from 'path'

import config from 'config'
import winston from 'winston'

process.env.ALLOW_CONFIG_MUTATIONS = true
process.env.NODE_CONFIG_DIR = path.resolve(__dirname, 'config')

describe('Logging manager', () => {
  describe('when no logger is specifed', () => {
    it('logs errors to console', async () => {
      jest.spyOn(global.console, 'error').mockImplementation()
      const { default: logger } = await import('../index')
      logger.error('an error message')
      expect(console.error).toHaveBeenCalled()
      console.error.mockRestore()
    })

    it('logs warn to console', async () => {
      jest.spyOn(global.console, 'warn').mockImplementation()
      const { default: logger } = await import('../index')
      logger.warn('a warn message')
      expect(console.warn).toHaveBeenCalled()
      console.warn.mockRestore()
    })

    it('logs info to console', async () => {
      jest.spyOn(global.console, 'info').mockImplementation()
      const { default: logger } = await import('../index')
      logger.info('an info message')
      expect(console.info).toHaveBeenCalled()
      console.info.mockRestore()
    })

    it('logs debug to console', async () => {
      jest.spyOn(global.console, 'log').mockImplementation()
      const { default: logger } = await import('../index')
      logger.debug('a debug message')
      expect(console.log).toHaveBeenCalled()
      console.log.mockRestore()
    })

    it('can stream logs to console', async () => {
      jest.spyOn(global.console, 'info').mockImplementation()
      const { default: logger } = await import('../index')
      logger.stream.write('a stream message')
      expect(console.info).toHaveBeenCalled()
      console.info.mockRestore()
    })
  })

  describe('when configure method is passed another logger', () => {
    it('works with winston', async () => {
      const { default: logger } = await import('../index')

      jest.spyOn(winston, 'debug').mockImplementation()
      jest.spyOn(winston, 'info').mockImplementation()
      jest.spyOn(winston, 'warn').mockImplementation()
      jest.spyOn(winston, 'error').mockImplementation()
      logger.configure(winston)

      logger.debug('debug')
      expect(winston.debug).toHaveBeenLastCalledWith('debug')
      logger.info('info')
      expect(winston.info).toHaveBeenLastCalledWith('info')
      logger.warn('warn')
      expect(winston.warn).toHaveBeenLastCalledWith('warn')
      logger.error('error')
      expect(winston.error).toHaveBeenLastCalledWith('error')
    })

    it('prevents configuration again', async () => {
      jest.resetModules()
      config = await import('config').default
      const { default: logger } = await import('../index')

      logger.configure(winston)
      expect(() => logger.configure(winston)).toThrow(/already been configured/)
    })
  })

  describe('has getRawLogger method', () => {
    it('which returns raw logger', async () => {
      jest.resetModules()
      const { default: logger } = await import('../index')

      logger.configure(winston)
      const rawLogger = logger.getRawLogger()
      expect(rawLogger).toBe(winston)
    })
  })

  describe('when a logger is passed by config', () => {
    it('sets logger to "winston" if specified', async () => {
      jest.resetModules()
      config = await import('config').default

      config.logger = winston
      const { default: logger } = await import('../index')
      const rawLogger = logger.getRawLogger()
      expect(rawLogger).toEqual(winston)
    })

    it('defaults to console', async () => {
      jest.resetModules()
      config = await import('config').default
      config.logger = null
      const { default: logger } = await import('../index')
      const rawLogger = logger.getRawLogger()
      expect(rawLogger).toEqual(global.console)
    })

    it('prevents configuration again', async () => {
      jest.resetModules()
      config = await import('config').default

      config.logger = winston
      const { default: logger } = await import('../index')
      expect(() => logger.configure(winston)).toThrow(/already been configured/)
    })
  })
})

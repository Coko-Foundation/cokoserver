/* eslint-disable no-console */
/* eslint-disable global-require */

const path = require('path')

process.env.ALLOW_CONFIG_MUTATIONS = true
process.env.NODE_CONFIG_DIR = path.resolve(__dirname, 'config')

let config = require('config')

describe('Logging manager', () => {
  describe('when no logger is specifed', () => {
    it('logs errors to console', () => {
      jest.spyOn(global.console, 'error').mockImplementation()
      const logger = require('../index')
      logger.error('an error message')
      expect(console.error).toHaveBeenCalled()
      console.error.mockRestore()
    })

    it('logs warn to console', () => {
      jest.spyOn(global.console, 'warn').mockImplementation()
      const logger = require('../index')
      logger.warn('a warn message')
      expect(console.warn).toHaveBeenCalled()
      console.warn.mockRestore()
    })

    it('logs info to console', () => {
      jest.spyOn(global.console, 'info').mockImplementation()
      const logger = require('../index')
      logger.info('an info message')
      expect(console.info).toHaveBeenCalled()
      console.info.mockRestore()
    })

    it('logs debug to console', () => {
      jest.spyOn(global.console, 'log').mockImplementation()
      const logger = require('../index')
      logger.debug('a debug message')
      expect(console.log).toHaveBeenCalled()
      console.log.mockRestore()
    })

    it('can stream logs to console', () => {
      jest.spyOn(global.console, 'info').mockImplementation()
      const logger = require('../index')
      logger.stream.write('a stream message')
      expect(console.info).toHaveBeenCalled()
      console.info.mockRestore()
    })
  })

  describe('when configure method is passed another logger', () => {
    it('works with winston', () => {
      const logger = require('../index')
      const winston = require('winston')
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

    it('prevents configuration again', () => {
      jest.resetModules()
      config = require('config')
      const logger = require('../index')
      const winston = require('winston')
      logger.configure(winston)
      expect(() => logger.configure(winston)).toThrow(/already been configured/)
    })
  })

  describe('has getRawLogger method', () => {
    it('which returns raw logger', () => {
      jest.resetModules()
      const logger = require('../index')
      const winston = require('winston')
      logger.configure(winston)
      const rawLogger = logger.getRawLogger()
      expect(rawLogger).toBe(winston)
    })
  })

  describe('when a logger is passed by config', () => {
    it('sets logger to "winston" if specified', () => {
      jest.resetModules()
      config = require('config')
      const winston = require('winston')
      config.logger = winston
      const logger = require('../index')
      const rawLogger = logger.getRawLogger()
      expect(rawLogger).toEqual(require('winston'))
    })

    it('defaults to console', () => {
      jest.resetModules()
      config = require('config')
      config.logger = null
      const logger = require('../index')
      const rawLogger = logger.getRawLogger()
      expect(rawLogger).toEqual(global.console)
    })

    it('prevents configuration again', () => {
      jest.resetModules()
      config = require('config')
      const winston = require('winston')
      config.logger = winston
      const logger = require('../index')
      expect(() => logger.configure(winston)).toThrow(/already been configured/)
    })
  })
})

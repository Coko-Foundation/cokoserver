const Joi = require('joi')

const { boss } = require('./boss')
const JobManagerOptionsError = require('./JobManagerOptionsError')

class JobManager {
  #boss
  #validationSchemas

  constructor(passedBoss) {
    this.#boss = passedBoss

    this.#validationSchemas = {
      send: Joi.object({
        startAfter: Joi.number().integer().positive().optional(),
      }),
    }
  }

  static #validateOptions(schema, options) {
    const validationResult = schema.validate(options)

    if (validationResult.error) {
      throw new JobManagerOptionsError(validationResult.error)
    }
  }

  async sendToQueue(queueName, data, options = {}) {
    JobManager.#validateOptions(this.#validationSchemas.send, options)
    await this.#boss.send(queueName, data, options)
  }

  async getQueueSize(queueName) {
    const size = await this.#boss.getQueueSize(queueName)
    return size
  }

  async waitForQueueToEmpty(queueName, options = {}) {
    const interval = options.interval || 500
    const timeout = options.timeout || 60000
    const selfBoss = this.#boss

    return new Promise((resolve, reject) => {
      /* eslint-disable prefer-const */
      let intervalId
      let timeoutId
      /* eslint-enable prefer-const */

      async function checkIsEmpty() {
        try {
          const size = await selfBoss.getQueueSize(queueName)

          if (size === 0) {
            clearInterval(intervalId)
            clearTimeout(timeoutId)
            resolve()
          }
        } catch (e) {
          clearInterval(intervalId)
          clearTimeout(timeoutId)
          reject(e)
        }
      }

      intervalId = setInterval(checkIsEmpty, interval)

      timeoutId = setTimeout(() => {
        clearInterval(intervalId)
        reject(
          new Error(
            `Waiting for queue ${queueName} to empty timed out after ${timeout} ms.`,
          ),
        )
      }, timeout)
    })
  }
}

module.exports = { JobManager, jobManager: new JobManager(boss) }

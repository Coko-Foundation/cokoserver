const Joi = require('joi')

const JobManagerOptionsError = require('./JobManagerOptionsError')

class JobManager {
  #boss
  #validationSchemas

  constructor(boss) {
    this.#boss = boss

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
}

module.exports = JobManager

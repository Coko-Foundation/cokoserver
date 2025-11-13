import Joi from 'joi'

import { boss } from './boss'
import JobManagerOptionsError from './JobManagerOptionsError'

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

  static #validateOptions(schema, options): void {
    const validationResult = schema.validate(options)

    if (validationResult.error) {
      throw new JobManagerOptionsError(validationResult.error)
    }
  }

  async sendToQueue(queueName, data, options = {}): Promise<void> {
    JobManager.#validateOptions(this.#validationSchemas.send, options)
    await this.#boss.send(queueName, data, options)
  }
}

const jobManager = new JobManager(boss)

export { JobManager, jobManager }

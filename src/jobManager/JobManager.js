const Joi = require('joi')
const isMatch = require('lodash/isMatch')

const db = require('../db/db')
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

  /* eslint-disable-next-line class-methods-use-this */
  async waitForJobsToFinish(queueName, filterData, options = {}) {
    const interval = options.interval || 500
    const timeout = options.timeout || 60000

    return new Promise((resolve, reject) => {
      /* eslint-disable prefer-const */
      let intervalId
      let timeoutId
      /* eslint-enable prefer-const */

      async function checkIsDone() {
        try {
          const res = await db.raw(`
            SELECT
              id,
              name,
              state,
              data
            FROM
              pgboss.job
            WHERE
              name = '${queueName}'
          `)

          const match = res.rows.filter(row => isMatch(row.data, filterData))

          if (match.length === 0) {
            throw new Error(
              `No jobs match the filter ${JSON.stringify(filterData)}`,
            )
          }

          const pending = match.filter(row => row.state === 'created')
          if (pending.length > 0) return

          const active = match.filter(row => row.state === 'active')
          if (active.length > 0) return

          clearInterval(intervalId)
          clearTimeout(timeoutId)
          resolve()
        } catch (e) {
          clearInterval(intervalId)
          clearTimeout(timeoutId)
          reject(e)
        }
      }

      intervalId = setInterval(checkIsDone, interval)

      timeoutId = setTimeout(() => {
        clearInterval(intervalId)
        reject(
          new Error(
            `Job in queue "${queueName}" with data matching ${JSON.stringify(
              filterData,
            )} did not complete before timeout of ${timeout} ms.`,
          ),
        )
      }, timeout)
    })
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

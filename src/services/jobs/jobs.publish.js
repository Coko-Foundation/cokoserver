const config = require('config')
const isEmpty = require('lodash/isEmpty')

const logger = require('../../logger')
const { boss } = require('../../jobs')

/**
 * Publish a named job and job data to the job queue.
 * Throw an error if invalid arguments are provided.
 * @param {string} name
 *   A unique name which identifies the job handler.
 * @param { object } startAfter
 *   Defines the number of seconds after which to run the job.
 * @param { Object } data
 *   Params to pass to the job handler callback.
 * @param {Object} [options]
 *   Optional scheduling parameters.
 */
const deferJob = async (name, startAfter, data, options) => {
  try {
    // This is equivalent to the "app.js:useJobQueue" check
    const jobQueueDisabled =
      config.has('useJobQueue') && config.get('useJobQueue') === false

    if (jobQueueDisabled) {
      throw new Error(`Job queue is disabled`)
    }

    await boss.publish(name, data || null, {
      ...options,
      startAfter: toSeconds(startAfter),
    })
  } catch (e) {
    logger.error(`Job ${name}: publish error:`, e)
    throw e
  }
}

/**
 * Convert an object representation of a time offset into a seconds offset.
 * Throw an error if invalid arguments are provided.
 * @param {number} [days=0] - Offset by this number of days.
 * @param {number} [hours=0] - Offset by this number of hours.
 * @param {number} [minutes=0] - Offset by this number of minutes.
 * @param {number} [seconds=0] - Offset by this number of seconds.
 * @returns {number} - A number of seconds
 */
const toSeconds = ({
  days = 0,
  hours = 0,
  minutes = 0,
  seconds = 0,
  ...invalid
}) => {
  if (!isEmpty(invalid)) {
    throw new Error(`Invalid keys: ${JSON.stringify(Object.keys(invalid))}`)
  }

  const offset = ((days * 24 + hours) * 60 + minutes) * 60 + seconds

  if (Number.isNaN(offset)) {
    throw new Error(
      `Invalid values: ${JSON.stringify([days, hours, minutes, seconds])}`,
    )
  }

  return offset
}

module.exports = { deferJob }

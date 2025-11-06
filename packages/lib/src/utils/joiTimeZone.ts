/**
 * Credit: https://github.com/tjdavey/joi-tz/blob/main/lib/index.js
 * Copied because eslint didn't want to play ball with this lib
 */

import Joi from 'joi'

const isValidTimezone = (zone: string): boolean => {
  if (!zone) return false

  try {
    new Intl.DateTimeFormat('en-US', { timeZone: zone }).format()
    return true
  } catch (e) {
    return false
  }
}

const joiTimeZone = {
  type: 'timezone',
  base: Joi.string(),
  messages: {
    timezone: '"{{#label}}" must be a valid timezone',
  },
  rules: {},
  validate(value, helpers) {
    if (!isValidTimezone(value)) {
      return { value, errors: helpers.error('timezone') }
    }

    return { value }
  },
}

export default joiTimeZone

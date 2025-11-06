/**
 * Credit: https://github.com/tjdavey/joi-tz/blob/main/lib/index.js
 * Copied because eslint didn't want to play ball with this lib
 */

import Joi from 'joi'
import { IANAZone } from 'luxon'

const joiTimeZone = {
  type: 'timezone',
  base: Joi.string(),
  messages: {
    timezone: '"{{#label}}" must be a valid timezone',
  },
  rules: {},
  validate(value, helpers) {
    if (!IANAZone.isValidZone(value)) {
      return { value, errors: helpers.error('timezone') }
    }

    return { value }
  },
}

export default joiTimeZone

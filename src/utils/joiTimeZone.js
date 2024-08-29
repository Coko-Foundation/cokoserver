/**
 * Credit: https://github.com/tjdavey/joi-tz/blob/main/lib/index.js
 * Copied because eslint didn't want to play ball with this lib
 */

const Joi = require('joi')
const { IANAZone } = require('luxon')

module.exports = {
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

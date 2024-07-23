const Joi = require('joi')
const cronValidate = require('cron-validate')

module.exports = {
  type: 'cron',
  base: Joi.string(),
  messages: {
    'cron.base': '"{{#label}}" must be a valid 5-level cron pattern',
  },
  rules: {},
  validate(value, helpers) {
    if (!cronValidate(value).isValid()) {
      return { value, errors: helpers.error('cron.base') }
    }

    return { value }
  },
}

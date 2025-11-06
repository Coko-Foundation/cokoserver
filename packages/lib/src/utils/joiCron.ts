import Joi from 'joi'
import cronValidate from 'cron-validate'

const joiCron = {
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

export default joiCron

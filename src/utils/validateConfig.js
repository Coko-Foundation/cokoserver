const BaseJoi = require('joi')

const ConfigSchemaError = require('../errors/ConfigSchemaError')
const JoiCron = require('./joiCron')
const JoiTimezone = require('./joiTimeZone')
const defaultJobQueueNames = require('../jobManager/defaultJobQueueNames')

const Joi = BaseJoi.extend(JoiCron).extend(JoiTimezone)

const removedKeys = [
  'apollo',
  'authsome',
  'password-reset.token-length',
  'pubsweet-client',
  'publicKeys',
  'useJobQueue',
]

const renameMap = {
  'password-reset': 'passwordReset',
}

const throwPubsweetKeyError = key => {
  throw new ConfigSchemaError(
    `The "${key}" key has been removed. Move all configuration that existed under "${key}" to the top level of your config.`,
  )
}

const throwRemovedError = key => {
  throw new ConfigSchemaError(`The "${key}" key has been removed.`)
}

const fileStorageRequired = errors => {
  if (
    errors.find(e => e.local.key === 'fileStorage' && e.code === 'any.required')
  ) {
    return new Error(
      'fileStorage configuration is required when useFileStorage is true',
    )
  }

  return errors
}

// const defaultJobQueueNames = defaultJobQueues.map(q => q.name)
const reservedQueueNames = Object.keys(defaultJobQueueNames).map(
  key => defaultJobQueueNames[key],
)

// reserving email, as it will be implemented
const predefined = [...reservedQueueNames, 'email']

const schema = Joi.object({
  fileStorage: Joi.when('useFileStorage', {
    is: true,
    then: Joi.object({
      accessKeyId: Joi.string().required(),
      secretAccessKey: Joi.string().required(),

      bucket: Joi.string().required(),
      region: Joi.string().optional(),

      protocol: Joi.string().required(),
      host: Joi.string().required(),
      port: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
      minioConsolePort: Joi.alternatives()
        .try(Joi.string(), Joi.number())
        .required(),

      s3ForcePathStyle: Joi.boolean().optional(),
      s3SeparateDeleteOperations: Joi.boolean().optional(),

      maximumWidthForSmallImages: Joi.alternatives()
        .try(Joi.string(), Joi.number())
        .optional(),
      maximumWidthForMediumImages: Joi.alternatives()
        .try(Joi.string(), Joi.number())
        .optional(),
    })
      .required()
      .error(errors => fileStorageRequired(errors)),
    otherwise: Joi.any().forbidden().messages({
      '*': 'Cannot use file storage key when useFileStorage is false',
    }),
  }),

  jobQueues: Joi.array()
    .items(
      Joi.object({
        name: Joi.string()
          .invalid(...predefined)
          .required()
          .messages({
            'any.invalid':
              '{{#label}} is not allowed to be "{{#value}}", as it is a reserved queue name',
          }),
        handler: Joi.function().required(),
        teamSize: Joi.number().integer().positive().optional(),
        teamConcurrency: Joi.number().integer().positive().optional(),
        schedule: Joi.cron().optional(),
        scheduleTimezone: Joi.when('schedule', {
          is: Joi.exist(),
          then: Joi.timezone().optional(),
          otherwise: Joi.forbidden().messages({
            '*': '{{#label}} is not allowed when "schedule" is not defined',
          }),
        }),
      }).unknown(false),
    )
    .optional()
    .unique('name'),

  logger: Joi.object({
    info: Joi.func().required(),
    debug: Joi.func().required(),
    error: Joi.func().required(),
    warn: Joi.func().required(),
  }).optional(),

  useFileStorage: Joi.boolean().optional(),
}).unknown(true)

const check = config => {
  if (config.pubsweet) throwPubsweetKeyError('pubsweet')
  if (config['pubsweet-server']) throwPubsweetKeyError('pubsweet-server')

  removedKeys.forEach(key => {
    if (config[key]) throwRemovedError(key)
  })

  Object.keys(renameMap).forEach(key => {
    if (config[key]) {
      throw new ConfigSchemaError(
        `Key ${key} has been renamed to ${renameMap[key]}`,
      )
    }
  })

  const validationResult = schema.validate(config)

  if (validationResult.error) {
    throw new ConfigSchemaError(validationResult.error)
  }
}

module.exports = check

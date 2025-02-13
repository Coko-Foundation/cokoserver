const BaseJoi = require('joi')
const has = require('lodash/has')

const ConfigSchemaError = require('../errors/ConfigSchemaError')
const JoiCron = require('./joiCron')
const JoiTimezone = require('./joiTimeZone')
const defaultJobQueueNames = require('../jobManager/defaultJobQueueNames')

const Joi = BaseJoi.extend(JoiCron).extend(JoiTimezone)

const removedKeys = [
  'apollo',
  'app',
  'authsome',
  'cron',
  'dbManager',
  'host',
  'ignoreTerminatedConnectionError',
  'password-reset.token-length',
  'publicKeys',
  'pubsweet-client',
  'pubsweet-server.apollo',
  'pubsweet-server.app',
  'pubsweet-server.cron',
  'pubsweet-server.host',
  'pubsweet-server.ignoreTerminatedConnectionError',
  'pubsweet-server.resolvers',
  'pubsweet-server.serveClient',
  'pubsweet-server.typedefs',
  'pubsweet-server.uploads',
  'resolvers',
  'serveClient',
  'typedefs',
  'uploads',
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
  corsOrigin: Joi.alternatives()
    .try(Joi.string(), Joi.array().items(Joi.string()))
    .optional(),

  dbConnectionReporter: Joi.alternatives()
    .try(
      Joi.boolean(),
      Joi.object({
        interval: Joi.number().integer().positive().optional(),
      }),
    )
    .optional(),

  devServerIgnore: Joi.array().items(Joi.string()).optional(),

  fileStorage: Joi.when('useFileStorage', {
    is: true,
    then: Joi.object({
      accessKeyId: Joi.string(),
      secretAccessKey: Joi.string(),

      url: Joi.string().required(),
      bucket: Joi.string().required(),
      region: Joi.string().optional(),

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

  inspectorPort: Joi.number(),

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
    if (has(config, key)) throwRemovedError(key)
  })

  Object.keys(renameMap).forEach(key => {
    if (has(config, key)) {
      throw new ConfigSchemaError(
        `Key ${key} has been renamed to ${renameMap[key]}`,
      )
    }
  })

  if (
    has(config, 'fileStorage.protocol') ||
    has(config, 'fileStorage.host') ||
    has(config, 'fileStorage.port')
  ) {
    throw new ConfigSchemaError(
      `File storage keys 'fileStorage.protocol', 'fileStorage.host' and 'fileStorage.port' have been dropped. Use the 'fileStorage.url' key instead.`,
    )
  }

  const validationResult = schema.validate(config)

  if (validationResult.error) {
    throw new ConfigSchemaError(validationResult.error)
  }
}

module.exports = check

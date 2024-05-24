const config = require('config')
const Joi = require('joi')

const { logTask, logTaskItem } = require('../logger/internals')
const ConfigSchemaError = require('../errors/ConfigSchemaError')

const removedKeys = [
  'apollo',
  'authsome',
  'password-reset.token-length',
  'pubsweet-client',
  'publicKeys',
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

  logger: Joi.object({
    info: Joi.func().required(),
    debug: Joi.func().required(),
    error: Joi.func().required(),
    warn: Joi.func().required(),
  }).optional(),

  useFileStorage: Joi.boolean().optional(),
  useJobQueue: Joi.boolean().optional(),
})

const check = () => {
  logTask('Checking configuration')

  if (config.has('pubsweet')) throwPubsweetKeyError('pubsweet')
  if (config.has('pubsweet-server')) throwPubsweetKeyError('pubsweet=server')

  removedKeys.forEach(key => {
    if (config.has(key)) throwRemovedError(key)
  })

  Object.keys(renameMap).forEach(key => {
    if (config.has(key)) {
      throw new ConfigSchemaError(
        `Key ${key} has been renamed to ${renameMap[key]}`,
      )
    }
  })

  const validationResult = schema.validate(config, { allowUnknown: true })

  if (validationResult.error) {
    throw new ConfigSchemaError(validationResult.error)
  }

  logTaskItem('Configuration check complete')
}

module.exports = check

const config = require('config')

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

  logTaskItem('Configuration check complete')
}

module.exports = check

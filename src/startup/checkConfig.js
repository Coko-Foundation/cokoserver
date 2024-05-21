const config = require('config')

const { logTask } = require('../logger/internals')
const ConfigSchemaError = require('../errors/ConfigSchemaError')

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

  const removedKeys = ['apollo', 'authsome', 'pubsweet-client', 'publicKeys']

  removedKeys.forEach(key => {
    if (config.has(key)) throwRemovedError(key)
  })
}

module.exports = check

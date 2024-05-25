const config = require('config')

const isEnvVariableTrue = variable => {
  return variable === true || variable === 'true' || variable === '1'
}

const isConfigKeyTrue = key => {
  if (!config.has(key)) return false
  return isEnvVariableTrue(config.get(key))
}

const isTrue = value => {
  return isEnvVariableTrue(value)
}

const isValidPositiveIntegerOrZero = n => {
  const value = Number(n)
  return Number.isInteger(value) && n >= 0
}

module.exports = {
  isEnvVariableTrue,
  isConfigKeyTrue,
  isValidPositiveIntegerOrZero,
  isTrue,
}

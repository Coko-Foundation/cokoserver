const { allow } = require('../../authorization')

module.exports = {
  Query: {
    '*': allow,
  },
  Mutation: {
    '*': allow,
  },
}

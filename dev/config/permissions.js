const {
  allow,
  // isAdmin
} = require('../../authorization')

module.exports = {
  Query: {
    // chatChannels: isAdmin,
    '*': allow,
  },
  Mutation: {
    '*': allow,
  },
}

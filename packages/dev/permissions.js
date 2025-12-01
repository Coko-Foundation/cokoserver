const {
  allow,
  deny,
  // isAdmin
} = require('@coko/server/authorization')

const permissions = {
  Query: {
    // chatChannels: isAdmin,
    '*': allow,
    users: deny,
  },
  Mutation: {
    '*': allow,
  },
}

module.exports = permissions

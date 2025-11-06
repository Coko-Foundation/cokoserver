const {
  allow,
  // isAdmin
} = require('@coko/server/authorization')

const permissions = {
  Query: {
    // chatChannels: isAdmin,
    '*': allow,
  },
  Mutation: {
    '*': allow,
  },
}

export default permissions

import { authorization } from '@coko/server'

const { allow, deny } = authorization

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

export default permissions

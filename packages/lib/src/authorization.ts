import {
  rule,
  inputRule,
  allow,
  deny,
  and,
  chain,
  or,
  not,
  race,
} from '@coko/graphql-shield'

import User from './models/user/user.model'

const isAuthenticated = rule()(async (_parent, _args, ctx) => {
  return !!ctx.userId
})

const isAdmin = rule()(async (_parent, _args, ctx) => {
  if (!ctx.userId) return false
  return User.hasGlobalRole(ctx.userId, 'admin')
})

export {
  rule,
  inputRule,
  allow,
  deny,
  and,
  chain,
  or,
  not,
  race,
  isAuthenticated,
  isAdmin,
}

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
} from 'graphql-shield'

const isAuthenticated = rule()(async (_parent, _args, ctx) => {
  return !!ctx.userId
})

const isAdmin = rule()(async (_parent, _args, ctx) => {
  if (!ctx.userId) return false

  const { default: User } = await import('./src/models/user/user.model')
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

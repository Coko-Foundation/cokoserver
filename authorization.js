const {
  rule,
  inputRule,
  allow,
  deny,
  and,
  chain,
  or,
  not,
  race,
} = require('graphql-shield')

const isAuthenticated = rule()(async (parent, args, ctx, info) => {
  return !!ctx.userId
})

const isAdmin = rule()(async (parent, args, ctx, info) => {
  if (!ctx.userId) return false

  /* eslint-disable-next-line global-require */
  const User = require('./src/models/user/user.model')
  return User.hasGlobalRole(ctx.userId, 'admin')
})

module.exports = {
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

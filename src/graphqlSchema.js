const config = require('config')
const isEmpty = require('lodash/isEmpty')
const merge = require('lodash/merge')

const { applyMiddleware } = require('graphql-middleware')
const { shield } = require('graphql-shield')
const { GraphQLUpload } = require('graphql-upload')
const { makeExecutableSchema } = require('apollo-server-express')

const logger = require('./logger')
const { logTask } = require('./logger/internals')
const tryRequireRelative = require('./tryRequireRelative')

const upload = require('./upload')
const emailMiddleware = require('./middleware/email')

// #region BUILD-SCHEMA
// load base types and resolvers
const typeDefs = [
  `type Query, type Mutation, type Subscription`,
  upload.typeDefs,
]

const resolvers = merge({}, upload.resolvers, {
  Upload: GraphQLUpload,
})

// recursively merge in component types and resolvers
function getSchemaRecursively(componentName) {
  const component = tryRequireRelative(componentName)

  if (component.extending) {
    getSchemaRecursively(component.extending)
  }

  if (component.typeDefs) {
    typeDefs.push(component.typeDefs)
  }

  if (component.resolvers) {
    merge(resolvers, component.resolvers)
  }
}

if (config.has('pubsweet.components')) {
  config.get('pubsweet.components').forEach(componentName => {
    getSchemaRecursively(componentName)
  })
}

// merge in app-specific types and resolvers from config
if (config.has('typeDefs')) {
  typeDefs.push(config.get('typeDefs'))
}

if (config.has('resolvers')) {
  merge(resolvers, config.get('resolvers'))
}

const schema = makeExecutableSchema({ typeDefs, resolvers })
// #endregion BUILD-SCHEMA

// #region GRAPHQL-MIDDLEWARE
const baseMessage = 'Coko server =>'

const logRegistration = name =>
  logger.info(`${baseMessage} Middleware: Registered ${name} middleware`)

const middleware = []
logTask('Register graphql middleware')

/**
 * Authorization middleware
 */

const permissions = config.has('permissions') && config.get('permissions')
const isProduction = process.env.NODE_ENV === 'production'

if (!isEmpty(permissions)) {
  const authorizationMiddleware = shield(permissions, {
    allowExternalErrors: true,
    debug: !isProduction,
  })

  middleware.push(authorizationMiddleware)
  logRegistration('authorization')
}

/**
 * Email middleware
 */

const emailConfig =
  config.has('emailMiddleware') && config.get('emailMiddleware')

if (!isEmpty(emailConfig)) {
  middleware.push(emailMiddleware)
  logRegistration('email')
}

logger.info('')
// #endregion GRAPHQL-MIDDLEWARE

const schemaWithMiddleWare = applyMiddleware(schema, ...middleware)

module.exports = schemaWithMiddleWare

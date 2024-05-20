const {
  ApolloServer,
  ForbiddenError,
  UserInputError,
  AuthenticationError,
  ApolloError,
} = require('apollo-server-express')

const isEmpty = require('lodash/isEmpty')
const config = require('config')

const errors = require('./errors')
const logger = require('./logger')
const helpers = require('./authorization')
const loaders = require('./graphql/loaders')
const schema = require('./graphqlSchema')

const isDevelopment = process.env.NODE_ENV === 'development'

const extraApolloConfig = config.has('pubsweet-server.apollo')
  ? config.get('pubsweet-server.apollo')
  : {}

const createGraphQLServer = testUserContext => {
  if (process.env.NODE_ENV !== 'test' && testUserContext) {
    throw new Error(
      'Do not pass a test user context unless you are running a test suite',
    )
  }

  const createdLoaders = loaders()

  const serverConfig = {
    uploads: false,
    schema,
    context: ({ req, res }) => ({
      helpers,
      user: testUserContext || req.user,
      loaders: createdLoaders,
      req,
      res,
    }),
    formatError: err => {
      const error = isEmpty(err.originalError) ? err : err.originalError

      logger.error(error.message, { error })

      const isPubsweetDefinedError = Object.values(errors).some(
        pubsweetError => error instanceof pubsweetError,
      )

      const isGraphqlDefinedError = [
        ForbiddenError,
        UserInputError,
        AuthenticationError,
        ApolloError,
      ].some(graphqlError => error instanceof graphqlError)

      // err is always a GraphQLError which should be passed to the client
      if (
        !isEmpty(err.originalError) &&
        !isPubsweetDefinedError &&
        !isGraphqlDefinedError
      )
        return {
          name: 'Server Error',
          message: 'Something went wrong! Please contact your administrator',
        }

      if (isGraphqlDefinedError) return error

      return {
        name: error.name || 'GraphQLError',
        message: error.message,
        extensions: {
          code: err.extensions.code,
        },
      }
    },
    introspection: process.env.NODE_ENV === 'development',
    ...extraApolloConfig,
  }

  if (isDevelopment) {
    const host = `${config.get('pubsweet-server.host')}${
      config.get('pubsweet-server.port')
        ? `:${config.get('pubsweet-server.port')}`
        : ''
    }`

    serverConfig.playground = {
      subscriptionEndpoint: `ws://${host}/subscriptions`,
    }
  }

  return new ApolloServer(serverConfig)
}

module.exports = createGraphQLServer

/* eslint-disable-next-line import/extensions */
const graphqlUploadExpress = require('graphql-upload/graphqlUploadExpress.js')
const { useServer } = require('graphql-ws/lib/use/ws')
const { WebSocketServer } = require('ws')
const { expressMiddleware } = require('@apollo/server/express4')
const { ApolloServer } = require('@apollo/server')
const config = require('config')
const jwt = require('jsonwebtoken')

const {
  ApolloServerPluginDrainHttpServer,
} = require('@apollo/server/plugin/drainHttpServer')

const AuthenticationError = require('../errors/AuthenticationError')
const logger = require('../logger')

const loaders = require('./loaders')
const generateSchema = require('./generateSchema')

const setup = async (httpServer, app, passport) => {
  app.use(graphqlUploadExpress())

  const schema = generateSchema()

  /* SUBSCRIPTION SERVER */

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/subscriptions',
  })

  const getDynamicContext = (ctx, msg, args) => {
    const context = { userId: null }

    if (ctx.connectionParams.authToken) {
      try {
        const decodedToken = jwt.verify(
          ctx.connectionParams.authToken,
          config.get('secret'),
        )

        context.userId = decodedToken.id
      } catch (e) {
        throw new AuthenticationError(
          'Subscription authentication token invalid',
        )
      }
    }

    return context
  }

  // store it in a variable so it can be cleaned up on shutdown
  const subscriptionServerCleanup = useServer(
    {
      schema,
      context: (ctx, msg, args) => getDynamicContext(ctx, msg, args),
    },
    wsServer,
  )

  /* APOLLO SERVER */

  const apolloServer = new ApolloServer({
    schema,
    plugins: [
      // Proper shutdown for the HTTP server
      ApolloServerPluginDrainHttpServer({ httpServer }),

      // Proper shutdown for the WebSocket server
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await subscriptionServerCleanup.dispose()
            },
          }
        },
      },
    ],
    introspection: process.env.NODE_ENV === 'development',
    csrfPrevention: true,
    formatError: error => {
      logger.error(error)
      return error
    },
  })

  await apolloServer.start()

  /* APOLLO EXPRESS */

  const createdLoaders = loaders()

  app.use(
    '/graphql',
    passport.authenticate(['bearer', 'anonymous'], {
      session: false,
    }),
    expressMiddleware(apolloServer, {
      context: ({ req, res }) => {
        return {
          userId: req.user, // req.user is set by passport
          loaders: createdLoaders,
          req,
          res,
        }
      },
    }),
  )
}

module.exports = setup

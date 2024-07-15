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

const loaders = require('./loaders')
const generateSchema = require('./generateSchema')

const setup = async (httpServer, app, passport) => {
  const schema = generateSchema()

  /* SUBSCRIPTION SERVER */

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/subscriptions',
  })

  const getDynamicContext = (ctx, msg, args) => {
    const context = { user: null }

    if (ctx.connectionParams.authToken) {
      try {
        const decodedToken = jwt.verify(
          ctx.connectionParams.authToken,
          config.get('secret'),
        )

        context.user = decodedToken.id
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
          user: req.user,
          loaders: createdLoaders,
          req,
          res,
        }
      },
    }),
  )

  app.use(graphqlUploadExpress())
}

module.exports = setup

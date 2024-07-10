/* eslint-disable-next-line import/extensions */
const graphqlUploadExpress = require('graphql-upload/graphqlUploadExpress.js')
const { useServer } = require('graphql-ws/lib/use/ws')
const { WebSocketServer } = require('ws')
const { expressMiddleware } = require('@apollo/server/express4')
const { ApolloServer } = require('@apollo/server')

const {
  ApolloServerPluginDrainHttpServer,
} = require('@apollo/server/plugin/drainHttpServer')

const { token } = require('../authentication')
const logger = require('../logger')

const schema = require('./schema')
const loaders = require('./loaders')

const setup = async (httpServer, app, passport) => {
  /* SUBSCRIPTION SERVER */

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/subscriptions',
  })

  const getDynamicContext = async (ctx, msg, args) => {
    if (!ctx.connectionParams.authToken) throw new Error('Missing auth token')

    return new Promise((resolve, reject) => {
      token.verify(ctx.connectionParams.authToken, (_, id) => {
        if (!id) {
          logger.info('Bad auth token')
          reject(new Error('Bad auth token'))
        }

        resolve({ user: id })
      })
    })
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

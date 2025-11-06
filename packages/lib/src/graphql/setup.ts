// @ts-nocheck

import { useServer } from 'graphql-ws/lib/use/ws'
import { WebSocketServer } from 'ws'
import { expressMiddleware } from '@apollo/server/express4'
import { ApolloServer } from '@apollo/server'
import jwt from 'jsonwebtoken'

import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default'

import AuthenticationError from '../errors/AuthenticationError'
import config from '../configManager/config'
import logger from '../logger'

import loaders from './loaders'
import generateSchema from './generateSchema'

/* eslint-disable-next-line import/extensions */
const graphqlUploadExpress = require('graphql-upload/graphqlUploadExpress.js')

const setup = async (httpServer, app, passport) => {
  // it is important that this runs before generateSchema (applyMiddleware specifically),
  // otherwise uploads will not work, showing a POST body empty error
  app.use(graphqlUploadExpress())

  const schema = await generateSchema()

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

      // Embed apollo explorer
      process.env.NODE_ENV === 'development' &&
        ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ].filter(Boolean),
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

export default setup

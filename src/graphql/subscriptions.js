// const { execute, subscribe } = require('graphql')
// const { SubscriptionServer } = require('subscriptions-transport-ws')

const { WebSocketServer } = require('ws')
const { useServer } = require('graphql-ws/lib/use/ws')

const logger = require('../logger')

const graphqlSchema = require('../graphqlSchema')
const { token } = require('../authentication')

module.exports = {
  addSubscriptions: httpServer => {
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

    useServer(
      {
        schema: graphqlSchema,
        context: (ctx, msg, args) => getDynamicContext(ctx, msg, args),
      },
      wsServer,
    )
  },
}

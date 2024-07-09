/**
 * subscription (websocket) server for GraphQL
 */
const { execute, subscribe } = require('graphql')
const { SubscriptionServer } = require('subscriptions-transport-ws')

const logger = require('../logger')

const graphqlSchema = require('../graphqlSchema')
const { token } = require('../authentication')

module.exports = {
  addSubscriptions: httpServer => {
    SubscriptionServer.create(
      {
        schema: graphqlSchema,
        execute,
        subscribe,
        // // Ensures the same graphql validation rules are applied to both the Subscription Server and the ApolloServer
        // validationRules: server.requestOptions.validationRules, // where server is apollo server
        onConnect: (connectionParams, webSocket, context) => {
          if (!connectionParams.authToken) {
            throw new Error('Missing auth token')
          }

          return new Promise((resolve, reject) => {
            token.verify(connectionParams.authToken, (_, id) => {
              if (!id) {
                logger.info('Bad auth token')
                reject(new Error('Bad auth token'))
              }

              resolve({ user: id })
            })
          })
        },
      },
      {
        server: httpServer,
        path: '/subscriptions',
        // path: server.graphqlPath, // where server is apollo server
      },
    )
  },
}

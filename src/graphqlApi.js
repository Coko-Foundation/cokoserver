const { expressMiddleware } = require('@apollo/server/express4')
const { graphqlUploadExpress } = require('graphql-upload')

const createGraphQLServer = require('./graphqlServer')
const loaders = require('./graphql/loaders')

const api = async app => {
  const apolloServer = createGraphQLServer()
  await apolloServer.start()

  const createdLoaders = loaders()

  app.use(
    '/graphql',
    app.locals.passport.authenticate(['bearer', 'anonymous'], {
      session: false,
    }),
    expressMiddleware(apolloServer, {
      context: ({ req, res }) => {
        return {
          // user: testUserContext || req.user,
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

module.exports = api

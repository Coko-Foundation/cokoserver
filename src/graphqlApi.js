const { graphqlUploadExpress } = require('graphql-upload')

const createGraphQLServer = require('./graphqlServer')
const { corsConfig } = require('./startup/cors')

const api = app => {
  app.use(
    '/graphql',
    app.locals.passport.authenticate(['bearer', 'anonymous'], {
      session: false,
    }),
  )

  app.use(graphqlUploadExpress())

  const server = createGraphQLServer()
  const CORSConfig = corsConfig()

  server.applyMiddleware({ app, cors: CORSConfig })
}

module.exports = api

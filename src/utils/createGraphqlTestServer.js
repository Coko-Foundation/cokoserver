const { ApolloServer } = require('@apollo/server')

const createGraphqlTestServer = () => {
  /* eslint-disable-next-line global-require */
  const generateSchema = require('../graphql/generateSchema')
  return new ApolloServer({ schema: generateSchema() })
}

module.exports = createGraphqlTestServer

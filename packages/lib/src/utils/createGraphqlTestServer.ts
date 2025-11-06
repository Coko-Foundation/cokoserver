import { ApolloServer } from '@apollo/server'

const createGraphqlTestServer = async () => {
  const { default: generateSchema } = await import('../graphql/generateSchema')
  const schema = await generateSchema()
  return new ApolloServer({ schema })
}

export default createGraphqlTestServer

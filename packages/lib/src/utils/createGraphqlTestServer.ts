import { ApolloServer } from '@apollo/server'

const createGraphqlTestServer = async (): Promise<ApolloServer> => {
  const { default: generateSchema } = await import('../graphql/generateSchema')
  const schema = await generateSchema()
  return new ApolloServer({ schema })
}

export default createGraphqlTestServer

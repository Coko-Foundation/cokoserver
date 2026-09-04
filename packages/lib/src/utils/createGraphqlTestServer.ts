import { ApolloServer } from '@apollo/server'
import generateSchema from '../graphql/generateSchema'

const createGraphqlTestServer = async (): Promise<ApolloServer> => {
  const schema = await generateSchema()
  return new ApolloServer({ schema })
}

export default createGraphqlTestServer

const { ApolloServer } = require('@apollo/server')

const generateSchema = require('../graphql/generateSchema')

const server = new ApolloServer({ schema: generateSchema() })

module.exports = server

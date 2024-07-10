const { ApolloServer } = require('@apollo/server')

const schema = require('../graphql/schema')

const server = new ApolloServer({ schema })

module.exports = server

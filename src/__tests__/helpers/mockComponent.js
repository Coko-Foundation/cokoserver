const { StatusCodes } = require('http-status-codes')
const gql = require('graphql-tag')

const mockComponent = {
  server: () => app => {
    app.use('/mock-component', (req, res, next) =>
      res.status(StatusCodes.OK).json({ ok: '!' }),
    )
  },
  typeDefs: gql`
    extend type Query {
      test: String
      ctxreq: String
      ctxres: String
    }

    extend type Mutation {
      create: Boolean!
    }

    extend type Subscription {
      itemUpdated: Boolean!
    }
  `,
  resolvers: {
    Query: {
      test: () => 'OK',
      // ctxreq: (_, __, ctx) => ctx.req.method,
      // ctxres: (_, __, ctx) => ctx.res.req.method,
    },
    Mutation: {
      create: () => true,
    },
    Subscription: {
      itemUpdated: () => true,
    },
  },
}

module.exports = mockComponent

import { Request, Response, Express } from 'express'
import { StatusCodes } from 'http-status-codes'
import gql from 'graphql-tag'

const mockComponent = {
  server:
    () =>
    (app: Express): void => {
      app.use('/mock-component', (_req: Request, res: Response) =>
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
      test: (): string => 'OK',
      // ctxreq: (_, __, ctx) => ctx.req.method,
      // ctxres: (_, __, ctx) => ctx.res.req.method,
    },
    Mutation: {
      create: (): boolean => true,
    },
    Subscription: {
      itemUpdated: (): boolean => true,
    },
  },
}

export default mockComponent

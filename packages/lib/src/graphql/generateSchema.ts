import isEmpty from 'lodash/isEmpty'
import merge from 'lodash/merge'

import GraphQLUpload from 'graphql-upload/GraphQLUpload.js'
import { applyMiddleware } from 'graphql-middleware'
import { GraphQLSchema } from 'graphql'
import { shield } from 'graphql-shield'

import { makeExecutableSchema } from '@graphql-tools/schema'

import config from '../configManager/config'
import internalLogger, { logReport } from '../logger/internals'
import loadComponent from '../utils/loadComponent'

const resolverPerformanceMiddleware = async (
  resolve,
  root,
  args,
  context,
  info,
): Promise<any> => {
  // Only top level resolver
  if (!info.path.prev) {
    const startTime = performance.now()

    const result = await resolve(root, args, context, info)

    const endTime = performance.now()
    const durationInSeconds = (endTime - startTime) / 1000 // Convert to seconds

    logReport(
      'Resolver performance:',
      `${info.operation.operation} ${
        info.operation.name?.value || 'anonymous'
      } took ${durationInSeconds.toPrecision(3)} seconds`,
    )

    return result
  }

  return resolve(root, args, context, info)
}

const generateSchema = async (): Promise<GraphQLSchema> => {
  const typeDefs = [
    `type Query, type Mutation, type Subscription, scalar Upload`,
  ]

  const resolvers = merge(
    {},
    {
      Upload: GraphQLUpload,
    },
  )

  if (config.has('components')) {
    await Promise.all(
      config.get('components').map(async componentName => {
        const component = await loadComponent(componentName)

        if (component.typeDefs) {
          typeDefs.push(component.typeDefs)
        }

        if (component.resolvers) {
          merge(resolvers, component.resolvers)
        }
      }),
    )
  }

  const schema = makeExecutableSchema({ typeDefs, resolvers })

  // console.log(schema)

  const middleware = []

  if (process.env.NODE_ENV === 'development') {
    middleware.push(resolverPerformanceMiddleware)
  }

  internalLogger.section('Register graphql middleware')

  /**
   * Authorization middleware
   */

  const permissions = config.has('permissions') && config.get('permissions')
  const isProduction = process.env.NODE_ENV === 'production'

  if (!isEmpty(permissions)) {
    const authorizationMiddleware = shield(permissions, {
      allowExternalErrors: true,
      debug: !isProduction,
    })

    middleware.push(authorizationMiddleware)
    internalLogger.success('Registered permissions middleware')
  } else {
    internalLogger.warn('No permissions middleware')
  }

  const schemaWithMiddleWare = applyMiddleware(schema, ...middleware)
  return schemaWithMiddleWare
}

export default generateSchema

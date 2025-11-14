class GraphQLDisabledError extends Error {
  constructor() {
    super()

    this.name = 'GraphQLDisabledError'
    this.message = `Cannot use GraphQL features when useGraphQLServer is false in the config`
  }
}

export default GraphQLDisabledError

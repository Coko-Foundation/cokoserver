const Sentry = require('@sentry/node')

function SentryApolloPlugin() {
  return {
    async requestDidStart(requestContext) {
      const operationName = requestContext.request.operationName || null
      const variables = requestContext.request.variables || null

      return {
        async didEncounterErrors(ctx) {
          /* eslint-disable-next-line no-restricted-syntax */
          for (const err of ctx.errors) {
            const original = err.originalError || err

            Sentry.withScope(scope => {
              if (operationName) {
                scope.setExtra('graphql operation', operationName)
              }

              if (ctx.request.query) {
                scope.setExtra('graphql query', ctx.request.query)
              }

              if (variables) {
                scope.setExtra('graphql variables', variables)
              }

              if (err.path) {
                scope.setExtra('graphql path', err.path)
              }

              if (ctx.request.http && ctx.request.http.headers) {
                scope.setExtra('headers', ctx.request.http.headers)
              }

              // Customize fingerprint to separate by resolver path: eg. group by resolver path + error name
              const pathFingerprint =
                err.path && Array.isArray(err.path)
                  ? err.path.join('.')
                  : 'no-path'

              const errorName =
                original && original.name ? original.name : 'GraphQLError'

              scope.setFingerprint([errorName, pathFingerprint])
              scope.setLevel('error')

              const userId = ctx.contextValue?.userId || null
              if (userId) scope.setUser({ id: userId })

              Sentry.captureException(original)
            })
          }
        },
      }
    },
  }
}

module.exports = SentryApolloPlugin

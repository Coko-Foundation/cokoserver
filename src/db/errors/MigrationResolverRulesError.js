class MigrationResolverRulesError extends Error {
  constructor(message, name) {
    super(message)

    this.message = `Starting with coko server v4: ${message}. This error occured in ${name}.`
    this.name = 'MigrationResolverRulesError'
  }
}

module.exports = MigrationResolverRulesError

class MigrationResolverRulesError extends Error {
  constructor(message: string, name: string) {
    super(message)

    this.message = `Starting with coko server v4: ${message}. This error occured in ${name}.`
    this.name = 'MigrationResolverRulesError'
  }
}

export default MigrationResolverRulesError

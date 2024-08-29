class MigrateOptionIntegrityError extends Error {
  constructor(message, max) {
    super(message)

    this.message = message
    this.name = 'MigrateOptionIntegrityError'
  }
}

module.exports = MigrateOptionIntegrityError

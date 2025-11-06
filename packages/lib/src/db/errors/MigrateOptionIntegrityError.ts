class MigrateOptionIntegrityError extends Error {
  constructor(message: string) {
    super(message)

    this.message = message
    this.name = 'MigrateOptionIntegrityError'
  }
}

export default MigrateOptionIntegrityError

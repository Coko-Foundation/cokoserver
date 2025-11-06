class MigrateSkipLimitError extends Error {
  constructor(message: string, max?: number) {
    super(message)

    if (max) {
      this.message = `${message} Maximum value for skip with current pending migrations is ${max}.`
    } else {
      this.message = message
    }

    this.name = 'MigrateSkipLimitError'
  }
}

export default MigrateSkipLimitError

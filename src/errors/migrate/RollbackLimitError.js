const ROLLBACK_LIMIT_MESSAGE =
  'Rollbacks can only go as far as the point where the coko server v4 upgrade occurred.'

class RollbackLimitError extends Error {
  constructor(message, options = {}) {
    super(message)

    const { metaLimit } = options

    if (metaLimit) {
      this.message = `${ROLLBACK_LIMIT_MESSAGE} ${message}`
    } else {
      this.message = message
    }

    this.name = 'RollbackLimitError'
  }
}

module.exports = RollbackLimitError

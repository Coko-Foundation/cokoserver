const ROLLBACK_LIMIT_MESSAGE =
  'Rollbacks can only go as far as the point where the coko server v4 upgrade occurred.'

type RollbackLimitErrorOptions = {
  metaLimit?: boolean
}

class RollbackLimitError extends Error {
  constructor(message: string, options: RollbackLimitErrorOptions = {}) {
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

export default RollbackLimitError

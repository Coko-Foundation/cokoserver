class RollbackUnavailableError extends Error {
  constructor(message) {
    super(message)

    this.message = `'Coko server meta table does not exist! Rollbacks only work starting coko server v4, which creates that table.'`
    this.name = 'RollbackUnavailableError'
  }
}

module.exports = RollbackUnavailableError

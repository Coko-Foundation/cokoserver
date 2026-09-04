class RollbackUnavailableError extends Error {
  constructor() {
    super()
    this.message = `'Coko server meta table does not exist! Rollbacks only work starting coko server v4, which creates that table.'`
    this.name = 'RollbackUnavailableError'
  }
}

export default RollbackUnavailableError

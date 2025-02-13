const config = require('config')

const { db } = require('../db')
const logger = require('../logger')
const { logReport } = require('../logger/internals')

const knexconnections = async () => {
  try {
    const inUse = await db.raw(
      "SELECT count(*) FROM pg_stat_activity WHERE state <> 'idle'",
    )

    const allConnections = await db.raw('SELECT count(*) FROM pg_stat_activity')

    const baseMessage = 'Database connection count report =>'

    logReport(`\n${baseMessage} DB object id:`, db.id)
    logReport(`${baseMessage} Connections in use:`, inUse.rows[0].count)
    logReport(`${baseMessage} Total connections:`, allConnections.rows[0].count)
  } catch (err) {
    logger.error('Error checking connections:', err)
  }
}

const startReporting = () => {
  if (
    config.has('dbConnectionReporter') &&
    config.get('dbConnectionReporter')
  ) {
    const interval =
      (config.has('dbConnectionReporter.interval') &&
        config.get('dbConnectionReporter.interval')) ||
      1000

    setInterval(knexconnections, interval)
  }
}

module.exports = startReporting

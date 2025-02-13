const knex = require('knex')
const config = require('config')
const { knexSnakeCaseMappers } = require('objection')
const { v4: uuid } = require('uuid')

const getDbConnectionConfig = require('./connectionConfig')

const connectionConfig = getDbConnectionConfig()

const pool = config.has('pool') && config.get('pool')

const acquireConnectionTimeout =
  (config.has('acquireConnectionTimeout') &&
    config.get('acquireConnectionTimeout')) ||
  5000

let db

if (!db) {
  db = knex({
    client: 'pg',
    connection: connectionConfig,
    pool,
    ...knexSnakeCaseMappers(),
    acquireConnectionTimeout,
    asyncStackTraces: true,
  })

  db.id = uuid()
}

module.exports = db

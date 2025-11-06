import knex, { Knex } from 'knex'
import { knexSnakeCaseMappers } from 'objection'

import config from '../configManager/config'
import getDbConnectionConfig from './connectionConfig'

const connectionConfig = getDbConnectionConfig()

const pool = config.has('pool') && config.get('pool')
const acquireConnectionTimeout = config.get('acquireConnectionTimeout')

let db: Knex

if (!db) {
  db = knex({
    client: 'pg',
    connection: connectionConfig,
    pool,
    ...knexSnakeCaseMappers(),
    acquireConnectionTimeout,
    asyncStackTraces: true,
  })
}

export default db

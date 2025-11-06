import knex, { Knex } from 'knex'
import { knexSnakeCaseMappers } from 'objection'
import { v4 as uuid } from 'uuid'

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

  db.id = uuid()
}

export default db

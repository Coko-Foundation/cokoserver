import knex, { Knex } from 'knex'
import { knexSnakeCaseMappers } from 'objection'

import config from '../configManager/config'
import getDbConnectionConfig from './connectionConfig'

// Attach to dummy function instead of class so that we can call db as a
// function (eg. db(table_name).select(...))
const manager = Object.assign(() => {}, {
  instance: null as Knex,
  init(): void {
    if (this.instance) return

    const connectionConfig = getDbConnectionConfig()
    const pool = config.has('pool') && config.get('pool')
    const acquireConnectionTimeout = config.get('acquireConnectionTimeout')

    this.instance = knex({
      client: 'pg',
      connection: connectionConfig,
      pool,
      ...knexSnakeCaseMappers(),
      acquireConnectionTimeout,
      asyncStackTraces: true,
    })
  },
})

const db = new Proxy(manager, {
  // get will intercept all db.someMethod or db.someProperty calls
  get(target, prop): any {
    if (prop === 'init') return target.init.bind(target)

    if (!target.instance) {
      throw new Error('Database not initialized. Run db.init() first.')
    }

    const value = (target.instance as any)[prop]
    return typeof value === 'function' ? value.bind(target.instance) : value
  },

  // apply will intercept all db(someArg) calls
  apply(target, _, args): any {
    if (!target.instance) {
      throw new Error('Database not initialized. Run db.init() first.')
    }

    return (target.instance as any)(...args)
  },
}) as unknown as Knex & { init: () => void }

export default db

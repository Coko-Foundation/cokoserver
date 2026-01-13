import { Knex } from 'knex'

// as defined in the jobmanager PgBoss contructor
import { newSchemaName as SCHEMA } from '../../jobManager/JobManager'

export async function up(db: Knex): Promise<void> {
  return db.raw(`
    INSERT INTO ${SCHEMA}.job (
        id,
        name,
        priority,
        data,
        retry_limit,
        retry_count,
        retry_delay,
        retry_backoff,
        start_after,
        singleton_key,
        singleton_on,
        expire_in,
        created_on,
        keep_until,
        output,
        policy
    )
    SELECT
        id,
        name,
        priority,
        data,
        retry_limit,
        retry_count,
        retry_delay,
        retry_backoff,
        start_after,
        singleton_key,
        singleton_on,
        expire_in,
        created_on,
        keep_until,
        output jsonb,
        policy
    FROM pgboss.job
    ON CONFLICT DO NOTHING
  `)
}

export async function down(_db: Knex): Promise<void> {
  // do nothing as the original schema is not deleted
  return null
}

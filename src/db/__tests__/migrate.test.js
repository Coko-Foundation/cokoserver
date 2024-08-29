const { MigrationError } = require('umzug')

const TestConfig = require('../../utils/TestConfig')

const db = require('../db')
const { migrate, rollback, pending, executed } = require('../migrate')
const { MIGRATIONS_TABLE } = require('../migrateDbHelpers')
const MigrateOptionIntegrityError = require('../errors/MigrateOptionIntegrityError')
const MigrateSkipLimitError = require('../errors/MigrateSkipLimitError')
const RollbackUnavailableError = require('../errors/RollbackUnavailableError')
const RollbackLimitError = require('../errors/RollbackLimitError')

const config = new TestConfig(
  {
    components: ['src/db/__tests__/mocks/succeeding'],
  },
  { useDb: true },
)

const failingConfig = new TestConfig(
  {
    components: ['src/db/__tests__/mocks/failing'],
  },
  { useDb: true },
)

describe('Migrations', () => {
  beforeAll(async () => {
    const tables = await db('pg_tables')
      .select('tablename')
      .where('schemaname', 'public')

    /* eslint-disable-next-line no-restricted-syntax */
    for (const t of tables) {
      /* eslint-disable-next-line no-await-in-loop */
      await db.raw(`DROP TABLE IF EXISTS public.${t.tablename} CASCADE`)
    }
  })

  afterEach(async () => {
    const tables = await db('pg_tables')
      .select('tablename')
      .where('schemaname', 'public')

    /* eslint-disable-next-line no-restricted-syntax */
    for (const t of tables) {
      /* eslint-disable-next-line no-await-in-loop */
      await db.raw(`DROP TABLE IF EXISTS public.${t.tablename} CASCADE`)
    }
  })

  afterAll(async () => {
    await db.destroy()
  })

  it('get pending migrations', async () => {
    await migrate(config, { step: 3 })
    const pend = await pending(config)
    expect(pend).toHaveLength(3)
  })

  it('get executed migrations', async () => {
    await migrate(config)
    const exec = await executed(config)
    expect(exec).toHaveLength(6)
  })

  describe('migrate', () => {
    it('migrates all files', async () => {
      const migrationsExistBefore = await db.schema.hasTable(MIGRATIONS_TABLE)
      expect(migrationsExistBefore).toBe(false)

      await migrate(config)

      const migrationsExistAfter = await db.schema.hasTable(MIGRATIONS_TABLE)
      expect(migrationsExistAfter).toBe(true)

      const exec = await executed(config)
      expect(exec).toHaveLength(6)
    })

    it('fails skipping last migration if options are invalid', async () => {
      await expect(migrate(config, { skipLast: 'test' })).rejects.toThrow(
        MigrateOptionIntegrityError,
      )

      await expect(migrate(config, { skipLast: '' })).rejects.toThrow(
        MigrateOptionIntegrityError,
      )

      await expect(migrate(config, { skipLast: {} })).rejects.toThrow(
        MigrateOptionIntegrityError,
      )

      await expect(migrate(config, { skipLast: 0 })).rejects.toThrow(
        MigrateOptionIntegrityError,
      )

      await expect(migrate(config, { skipLast: -1 })).rejects.toThrow(
        MigrateOptionIntegrityError,
      )
    })

    it('fails skipping if there are no migrations to skip', async () => {
      await migrate(config)

      await expect(migrate(config, { skipLast: 1 })).rejects.toThrow(
        MigrateSkipLimitError,
      )
    })

    it('fails skipping when the skip value is equal to all pending migrations', async () => {
      await migrate(config, { step: 3 })
      const pend = await pending(config)
      const skipLast = pend.length

      await expect(migrate(config, { skipLast })).rejects.toThrow(
        MigrateSkipLimitError,
      )
    })

    it('fails skipping when the skip value exceeds the number of pending migrations', async () => {
      await migrate(config, { step: 3 })
      const pend = await pending(config)
      const skipLast = pend.length + 1

      await expect(migrate(config, { skipLast })).rejects.toThrow(
        MigrateSkipLimitError,
      )
    })

    it('skips last x migrations', async () => {
      await migrate(config, { step: 3 }) // from a total of 6
      let pend = await pending(config)
      expect(pend).toHaveLength(3)

      await migrate(config, { skipLast: 2 })
      pend = await pending(config)
      expect(pend).toHaveLength(2)
    })

    it('migrates up to a specific migration', async () => {
      await migrate(config, { to: '1722326234-two.js' })
      const pend = await pending(config)
      expect(pend).toHaveLength(1)
    })

    it('throws an error when runnning a broken migration', async () => {
      await migrate(failingConfig, { skipLast: 1 })
      await expect(migrate(failingConfig)).rejects.toThrow(MigrationError)
    })
  })

  describe('rollback', () => {
    it('fails to rollback if there is no meta table', async () => {
      await expect(rollback(config)).rejects.toThrow(RollbackUnavailableError)
    })

    it('fails to rollback if the creation of the meta table is the last migration', async () => {
      await migrate(config, { step: 2 })
      await expect(rollback(config)).rejects.toThrow(RollbackLimitError)
    })

    it('will rollback one by default', async () => {
      await migrate(config)
      let pend = await pending(config)
      expect(pend).toHaveLength(0)
      await rollback(config)
      pend = await pending(config)
      expect(pend).toHaveLength(1)
    })

    it('rolls back to the last successful run', async () => {
      await migrate(failingConfig, { step: 3 })
      let pend = await pending(failingConfig)
      expect(pend).toHaveLength(4)

      await expect(migrate(failingConfig)).rejects.toThrow()
      pend = await pending(failingConfig)
      expect(pend).toHaveLength(1)

      await rollback(failingConfig, { lastSuccessfulRun: true })
      pend = await pending(failingConfig)
      expect(pend).toHaveLength(4)
    })

    it('ignores step if last successful run is true', async () => {
      await migrate(failingConfig, { step: 3 })
      let pend = await pending(failingConfig)
      expect(pend).toHaveLength(4)

      await expect(migrate(failingConfig)).rejects.toThrow()
      pend = await pending(failingConfig)
      expect(pend).toHaveLength(1)

      await rollback(failingConfig, { lastSuccessfulRun: true, step: 1 })
      pend = await pending(failingConfig)
      expect(pend).toHaveLength(4)
    })

    it('fails to rollback to last successful run if it is identical to the last migration', async () => {
      await migrate(config)

      await expect(
        rollback(config, { lastSuccessfulRun: true }),
      ).rejects.toThrow(RollbackLimitError)
    })

    it('fails to rollback if checkpoint is before the creation of the meta table', async () => {
      await migrate(failingConfig, { step: 1 })
      await expect(migrate(failingConfig)).rejects.toThrow()

      await expect(
        rollback(failingConfig, { lastSuccessfulRun: true }),
      ).rejects.toThrow(RollbackLimitError)
    })

    it('rolls back by x steps', async () => {
      await migrate(config)
      let pend = await pending(config)
      expect(pend).toHaveLength(0)

      await rollback(config, { step: 2 })
      pend = await pending(config)
      expect(pend).toHaveLength(2)
    })

    it('fails to rollback when step goes up to the meta checkpoint or beyong', async () => {
      await migrate(config) // meta checkpoint is the first migration
      const exec = await executed(config)

      await expect(rollback(config, { step: exec.length })).rejects.toThrow(
        RollbackLimitError,
      )
    })
  })
})

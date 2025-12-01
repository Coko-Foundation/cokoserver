import { describe, afterAll, beforeEach, it, expect } from 'vitest'
import { MigrationError } from 'umzug'

import config from '../../configManager/config'
import db from '../db'
import DbTestUtils from '../DbTestUtils'
import { migrate, rollback, pending, executed } from '../migrate'
import { MIGRATIONS_TABLE } from '../migrateDbHelpers'
import MigrateOptionIntegrityError from '../errors/MigrateOptionIntegrityError'
import MigrateSkipLimitError from '../errors/MigrateSkipLimitError'
import RollbackUnavailableError from '../errors/RollbackUnavailableError'
import RollbackLimitError from '../errors/RollbackLimitError'

describe('Migrations', () => {
  async function setSucceedingConfig(): Promise<void> {
    config.reset()
    await config.init({
      components: ['./src/db/__tests__/mocks/succeeding'],
    })
  }

  async function setFailingConfig(): Promise<void> {
    config.reset()
    await config.init({
      components: ['./src/db/__tests__/mocks/failing'],
    })
  }

  beforeEach(async () => {
    await DbTestUtils.dropAllTables()
    await setSucceedingConfig()
  })

  afterAll(async () => {
    config.reset()
    await DbTestUtils.dropAllTables()
    await db.destroy()
  })

  it('gets pending migrations', async () => {
    await migrate(config, { step: 3 })
    const pend = await pending(config)
    expect(pend).toHaveLength(4)
    expect(pend[0].name).toBeDefined()
    expect(pend[0].path).toBeDefined()
  })

  it('gets core migrations as pending if no components declared', async () => {
    config.reset()
    const pend = await pending(config)
    expect(pend).toHaveLength(4)
  })

  it('gets executed migrations', async () => {
    await migrate(config)
    const exec = await executed(config)
    expect(exec).toHaveLength(7)
  })

  describe('migrate', () => {
    it('migrates all files', async () => {
      const migrationsExistBefore = await db.schema.hasTable(MIGRATIONS_TABLE)
      expect(migrationsExistBefore).toBe(false)

      await migrate(config)

      const migrationsExistAfter = await db.schema.hasTable(MIGRATIONS_TABLE)
      expect(migrationsExistAfter).toBe(true)

      const exec = await executed(config)
      expect(exec).toHaveLength(7)
    })

    it('fails skipping last migration if options are invalid', async () => {
      // @ts-ignore
      await expect(migrate(config, { skipLast: 'test' })).rejects.toThrow(
        MigrateOptionIntegrityError,
      )

      // @ts-ignore
      await expect(migrate(config, { skipLast: '' })).rejects.toThrow(
        MigrateOptionIntegrityError,
      )

      // @ts-ignore
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
      await migrate(config, { step: 3 }) // from a total of 7
      let pend = await pending(config)
      expect(pend).toHaveLength(4)

      await migrate(config, { skipLast: 2 })
      pend = await pending(config)
      expect(pend).toHaveLength(2)
    })

    it('migrates up to a specific migration', async () => {
      await migrate(config, { to: '1722326234-two.ts' })
      const pend = await pending(config)
      expect(pend).toHaveLength(2)
    })

    it('throws an error when runnning a broken migration', async () => {
      await setFailingConfig()
      await migrate(config, { skipLast: 2 })
      await expect(migrate(config)).rejects.toThrow(MigrationError)
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
      await setFailingConfig()
      await migrate(config, { step: 3 })
      let pend = await pending(config)
      expect(pend).toHaveLength(5)

      await expect(migrate(config)).rejects.toThrow()
      pend = await pending(config)
      expect(pend).toHaveLength(2)

      await rollback(config, { lastSuccessfulRun: true })
      pend = await pending(config)
      expect(pend).toHaveLength(5)
    })

    it('ignores step if last successful run is true', async () => {
      await setFailingConfig()
      await migrate(config, { step: 3 })
      let pend = await pending(config)
      expect(pend).toHaveLength(5)

      await expect(migrate(config)).rejects.toThrow()
      pend = await pending(config)
      expect(pend).toHaveLength(2)

      await rollback(config, { lastSuccessfulRun: true, step: 1 })
      pend = await pending(config)
      expect(pend).toHaveLength(5)
    })

    it('fails to rollback to last successful run if it is identical to the last migration', async () => {
      await migrate(config)

      await expect(
        rollback(config, { lastSuccessfulRun: true }),
      ).rejects.toThrow(RollbackLimitError)
    })

    it('fails to rollback if checkpoint is before the creation of the meta table', async () => {
      await setFailingConfig()
      await migrate(config, { step: 1 })
      await expect(migrate(config)).rejects.toThrow()

      await expect(
        rollback(config, { lastSuccessfulRun: true }),
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

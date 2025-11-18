import { describe, beforeAll, afterAll, afterEach, it, expect } from 'vitest'

import db from '../db'
import { migrate } from '../migrate'
import config from '../../configManager/config'

import {
  migrations,
  migrationsMeta,
  MIGRATIONS_TABLE,
} from '../migrateDbHelpers'

describe('Migrate db helpers', () => {
  const LAST = '1762697452-remove-extension-from-migrations'

  beforeAll(async () => {
    config.reset()
    await config.init({
      components: ['src/db/__tests__/mocks/succeeding'],
    })
  })

  afterAll(async () => {
    await db.destroy()
  })

  describe('Migration db helper', () => {
    beforeAll(async () => {
      const tables = await db('pg_tables')
        .select('tablename')
        .where('schemaname', 'public')

      for (const t of tables) {
        /* eslint-disable-next-line no-await-in-loop */
        await db.raw(`DROP TABLE IF EXISTS public.${t.tablename} CASCADE`)
      }
    })

    afterEach(async () => {
      const tables = await db('pg_tables')
        .select('tablename')
        .where('schemaname', 'public')

      for (const t of tables) {
        /* eslint-disable-next-line no-await-in-loop */
        await db.raw(`DROP TABLE IF EXISTS public.${t.tablename} CASCADE`)
      }
    })

    it('creates migration table', async () => {
      await expect(db(MIGRATIONS_TABLE)).rejects.toThrow()
      await migrate(config)
      const tableExists = await db.schema.hasTable(MIGRATIONS_TABLE)
      expect(tableExists).toBe(true)
    })

    it('gets last migrations', async () => {
      await migrate(config)
      const last = await migrations.getLastMigration()
      expect(last).toEqual(LAST)
    })

    it('gets migration rows', async () => {
      await migrate(config)

      const rows = await migrations.getRows()
      expect(rows.length).toBe(7)

      expect(rows[0].id).toBe('1715865522-one-before-meta')
      expect(rows[rows.length - 3].id).toBe('1722326234-two')
      expect(rows[rows.length - 2].id).toBe('1722326235-three')
    })

    it('logs a migration', async () => {
      await migrate(config)

      const newMigration = 'test-me'
      await migrations.logMigration(newMigration)

      const last = await migrations.getLastMigration()
      expect(last).toBe(newMigration)
    })

    it('unlogs a migration', async () => {
      await migrate(config)
      const name = 'test'
      await migrations.logMigration(name)
      await migrations.unlogMigration(name)

      const last = await migrations.getLastMigration()
      expect(last).toBe(LAST)
    })
  })

  describe('Meta db helper', () => {
    beforeAll(async () => {
      const tables = await db('pg_tables')
        .select('tablename')
        .where('schemaname', 'public')

      for (const t of tables) {
        /* eslint-disable-next-line no-await-in-loop */
        await db.raw(`DROP TABLE IF EXISTS public.${t.tablename} CASCADE`)
      }
    })

    afterEach(async () => {
      const tables = await db('pg_tables')
        .select('tablename')
        .where('schemaname', 'public')

      for (const t of tables) {
        /* eslint-disable-next-line no-await-in-loop */
        await db.raw(`DROP TABLE IF EXISTS public.${t.tablename} CASCADE`)
      }
    })

    it('clears a migration checkpoint', async () => {
      await migrate(config)

      const checkOne = await migrationsMeta.getCheckpoint()
      expect(checkOne).not.toBe(null)

      await migrationsMeta.clearCheckpoint()
      const checkTwo = await migrationsMeta.getCheckpoint()
      expect(checkTwo).toBe(null)
    })

    it('checks that the meta table exists', async () => {
      const existsBefore = await migrationsMeta.exists()
      expect(existsBefore).toBe(false)

      await migrate(config)
      const existsAfter = await migrationsMeta.exists()
      expect(existsAfter).toBe(true)
    })

    it('gets checkpoint', async () => {
      await migrate(config)
      const checkpoint = await migrationsMeta.getCheckpoint()
      expect(checkpoint).toEqual(LAST)
    })

    it('gets table data', async () => {
      await migrate(config)
      const data = await migrationsMeta.getData()
      expect(data.lastSuccessfulMigrateCheckpoint).toEqual(LAST)
    })

    it('sets checkpoint', async () => {
      await migrate(config)
      const name = '1722326234-two'
      await migrationsMeta.setCheckpoint(name)
      const checkpoint = await migrationsMeta.getCheckpoint()
      expect(checkpoint).toEqual(name)
    })
  })
})

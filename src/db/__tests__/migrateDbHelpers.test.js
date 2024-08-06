const TestConfig = require('../../utils/TestConfig')

const db = require('../db')
const { migrate } = require('../migrate')

const { migrations, meta, MIGRATIONS_TABLE } = require('../migrateDbHelpers')

const config = new TestConfig(
  {
    components: ['src/db/__tests__/mocks/succeeding'],
  },
  { useDb: true },
)

describe('Migrate db helpers', () => {
  afterAll(async () => {
    await db.destroy()
  })

  describe('Migration db helper', () => {
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

    it('creates migration table', async () => {
      await expect(db(MIGRATIONS_TABLE)).rejects.toThrow()
      await migrate(config)
      const tableExists = await db.schema.hasTable(MIGRATIONS_TABLE)
      expect(tableExists).toBe(true)
    })

    it('gets last migrations', async () => {
      await migrate(config)
      const last = await migrations.getLastMigration()
      expect(last).toEqual('1722326235-three.js')
    })

    it('gets migration rows', async () => {
      await migrate(config)

      const rows = await migrations.getRows()
      expect(rows.length).toBe(6)

      expect(rows[0].id).toBe('1715865522-one-before-meta.js')
      expect(rows[rows.length - 2].id).toBe('1722326234-two.js')
      expect(rows[rows.length - 1].id).toBe('1722326235-three.js')
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
      expect(last).toBe('1722326235-three.js')
    })
  })

  describe('Meta db helper', () => {
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

    it('clears a migration checkpoint', async () => {
      await migrate(config)

      const checkOne = await meta.getCheckpoint()
      expect(checkOne).not.toBe(null)

      await meta.clearCheckpoint()
      const checkTwo = await meta.getCheckpoint()
      expect(checkTwo).toBe(null)
    })

    it('checks that the meta table exists', async () => {
      const existsBefore = await meta.exists()
      expect(existsBefore).toBe(false)

      await migrate(config)
      const existsAfter = await meta.exists()
      expect(existsAfter).toBe(true)
    })

    it('gets checkpoint', async () => {
      await migrate(config)
      const checkpoint = await meta.getCheckpoint()
      expect(checkpoint).toEqual('1722326235-three.js')
    })

    it('gets table data', async () => {
      await migrate(config)
      const data = await meta.getData()
      expect(data.lastSuccessfulMigrateCheckpoint).toEqual(
        '1722326235-three.js',
      )
    })

    it('sets checkpoint', async () => {
      await migrate(config)
      const name = '1722326234-two.js'
      await meta.setCheckpoint(name)
      const checkpoint = await meta.getCheckpoint()
      expect(checkpoint).toEqual(name)
    })
  })
})

import { describe, it, beforeEach, expect, beforeAll } from 'vitest'

import db from '../db'
import DbTestUtils from '../DbTestUtils'
import { migrations as migrationsTable } from '../migrateDbHelpers'

import { up } from '../coreMigrations/1762697452-remove-extension-from-migrations'
import config from '../../configManager/config'

describe('Remove extensions from migrations', () => {
  beforeAll(async () => {
    await config.init({ mailer: false })
    db.init()
  })

  beforeEach(async () => {
    await DbTestUtils.dropAllTables()
    await migrationsTable.createTable()
  })

  it('renames ids without extensions', async () => {
    await migrationsTable.logMigration('1-test.js')
    await migrationsTable.logMigration('2-test.js')
    await migrationsTable.logMigration('3-test.js')

    let migrationRows = await migrationsTable.getRows()
    expect(migrationRows).toHaveLength(3)
    expect(migrationRows[0].id).toBe('1-test.js')

    await up(db)

    migrationRows = await migrationsTable.getRows()
    expect(migrationRows).toHaveLength(3)
    expect(migrationRows[0].id).toBe('1-test')
    expect(migrationRows[1].id).toBe('2-test')
    expect(migrationRows[2].id).toBe('3-test')
  })

  it('drops all js, ts and sql extensions', async () => {
    await migrationsTable.logMigration('1-test.js')
    await migrationsTable.logMigration('2-test.ts')
    await migrationsTable.logMigration('3-test.sql')

    let migrationRows = await migrationsTable.getRows()
    expect(migrationRows).toHaveLength(3)
    expect(migrationRows[0].id).toBe('1-test.js')

    await up(db)

    migrationRows = await migrationsTable.getRows()
    expect(migrationRows).toHaveLength(3)
    expect(migrationRows[0].id).toBe('1-test')
    expect(migrationRows[1].id).toBe('2-test')
    expect(migrationRows[2].id).toBe('3-test')
  })

  it('does not drop extensions that are not js, ts or sql', async () => {
    await migrationsTable.logMigration('1-test.js')
    await migrationsTable.logMigration('2-test.ts')
    await migrationsTable.logMigration('3-test.model')

    let migrationRows = await migrationsTable.getRows()
    expect(migrationRows).toHaveLength(3)
    expect(migrationRows[0].id).toBe('1-test.js')

    await up(db)

    migrationRows = await migrationsTable.getRows()
    expect(migrationRows).toHaveLength(3)
    expect(migrationRows[0].id).toBe('1-test')
    expect(migrationRows[1].id).toBe('2-test')
    expect(migrationRows[2].id).toBe('3-test.model')
  })
})

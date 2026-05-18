import fs from 'fs-extra'
import path from 'path'

import { glob } from 'glob'

import {
  Umzug,
  MigrationParams,
  MigrationFn,
  MigrateUpOptions,
  MigrateDownOptions,
  MigrationMeta,
} from 'umzug'

import sortBy from 'lodash/sortBy'
import isFunction from 'lodash/isFunction'

import internalLogger from '../logger/internals'

import db from './db'
import {
  migrations as migrationsTable,
  migrationsMeta as metaTable,
} from './migrateDbHelpers'

import MigrationResolverRulesError from './errors/MigrationResolverRulesError'

type Migration = {
  name: string
  path: string
  up: MigrationFn
  down?: MigrationFn
}

export default class MigrationRunner {
  pattern: string
  threshold: number
  umzug: Umzug

  constructor(components: string[] = []) {
    const migrationPaths = components
      .map(c => {
        if (c.startsWith('.')) return path.join(process.cwd(), c)
        return path.dirname(require.resolve(c))
      })
      .map(modulePath => path.join(modulePath, 'migrations'))
      .concat(path.join(__dirname, 'coreMigrations'))
      .filter(fs.pathExistsSync)

    const globPatterns = migrationPaths.map(
      migrationPath => `${migrationPath}/*.{js,ts,sql}`,
    )

    if (globPatterns.length === 1) {
      this.pattern = globPatterns[0]
    } else {
      this.pattern = `{${globPatterns.join(',')}}`
    }
  }

  static stripMigrationExtensionName(filename: string): string {
    const filenameData = path.parse(filename)
    if (['.js', '.ts', '.sql'].includes(filenameData.ext)) {
      return filenameData.name
    }

    return filename
  }

  /**
   * The threshold represents from which point in time forward the rules will
   * apply (the creation of the meta table, ie. from the moment they upgraded to
   * coko server v4).
   */
  static async findThreshold(): Promise<number> {
    const metaExists = await metaTable.exists()
    if (!metaExists) return null
    const data = await metaTable.getData()

    const createdDateAsUnixTimestamp = Math.floor(
      new Date(data.created).getTime() / 1000,
    )

    return createdDateAsUnixTimestamp
  }

  /**
   * After installing v4, some rules will apply for migrations, but only for new
   * migrations, so that developers don't have to rewrite all existing migrations.
   */
  async parseMigration(filePath: string): Promise<Migration> {
    const name = path.parse(filePath).name
    const isSql = path.extname(filePath) === '.sql'
    const timestamp = parseInt(name.split('-')[0], 10)
    const isPastThreshold = this.threshold && timestamp > this.threshold

    /**
     * Any positive integer is a valid unix timestamp, might wanna switch to umzug's filename convention further down the line for robustness.
     * The current setup will work as long as the date is not less 1000000000 (some time in 2001).
     */
    const isUnixTimestamp =
      Number.isInteger(timestamp) &&
      timestamp >= 1000000000 &&
      timestamp <= 9999999999

    if (!isUnixTimestamp) {
      throw new MigrationResolverRulesError(
        `Migration files must start with a unix timestamp larger than 1000000000, followed by a dash (-)`,
        name,
      )
    }

    if (isSql) {
      if (isPastThreshold) {
        throw new MigrationResolverRulesError(
          `Migration files must be js or ts files. Use knex.raw if you need to write sql code`,
          name,
        )
      }

      return {
        name,
        path: filePath,
        up: async (): Promise<void> => {
          const fileContents = fs.readFileSync(filePath).toString()
          return db.raw(fileContents)
        },
      }
    }

    const { up, down } = await import(filePath)

    if (isPastThreshold) {
      if (!down || !isFunction(down)) {
        throw new MigrationResolverRulesError(
          `All migrations need to define a down function so that the migration can be rolled back`,
          name,
        )
      }
    }

    return {
      name,
      path: filePath,
      up: async (): Promise<void> => up(db),
      down: async (): Promise<void> => down(db),
    }
  }

  async init(): Promise<void> {
    this.threshold = await MigrationRunner.findThreshold()

    const allFiles = await glob(this.pattern)
    const files = allFiles.filter(file => !file.endsWith('.d.ts'))

    const migrations = await Promise.all(
      files.map(async filePath => this.parseMigration(filePath)),
    )
    const sortedMigrations = sortBy(migrations, 'name')

    const customStorage = {
      logMigration: async (
        migration: MigrationParams<object>,
      ): Promise<void> => {
        await migrationsTable.logMigration(migration.name)
      },

      unlogMigration: async (
        migration: MigrationParams<object>,
      ): Promise<void> => {
        await migrationsTable.unlogMigration(migration.name)
      },

      executed: async (): Promise<string[]> => {
        await migrationsTable.createTable()
        const rows = await migrationsTable.getRows()
        return rows.map(row =>
          MigrationRunner.stripMigrationExtensionName(row.id),
        )
      },
    }

    this.umzug = new Umzug({
      storage: customStorage,
      logger: undefined,
      migrations: sortedMigrations,
    })

    // this.umzug.on('migrating', e => {
    //   internalLogger.wait(`Migrating ${e.name}`)
    // })
    this.umzug.on('migrated', e => {
      internalLogger.success(`Successfully migrated ${e.name}`)
    })

    // this.umzug.on('reverting', e => internalLogger.wait(`Reverting ${e.name}`))
    this.umzug.on('reverted', e => {
      internalLogger.success(`Successfully reverted ${e.name}`)
    })
  }

  async up(options: MigrateUpOptions): Promise<void> {
    if (options.to) {
      options.to = MigrationRunner.stripMigrationExtensionName(options.to)
    }

    await this.umzug.up(options)
  }

  async down(options: MigrateDownOptions): Promise<void> {
    if (options.to) {
      options.to = MigrationRunner.stripMigrationExtensionName(options.to)
    }

    await this.umzug.down(options)
  }

  async pending(): Promise<MigrationMeta[]> {
    return await this.umzug.pending()
  }

  async executed(): Promise<MigrationMeta[]> {
    return await this.umzug.executed()
  }
}

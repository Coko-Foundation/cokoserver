const fs = require('fs')
const path = require('path')
const { extname } = require('path')
const config = require('config')
const { Umzug } = require('umzug')
const sortBy = require('lodash/sortBy')
const isFunction = require('lodash/isFunction')

const logger = require('../logger')
const db = require('./db')
const { migrations, meta } = require('./migrateDbHelpers')

const MigrateOptionIntegrityError = require('../errors/migrate/MigrateOptionIntegrityError')
const MigrateSkipLimitError = require('../errors/migrate/MigrateSkipLimitError')
const MigrationResolverRulesError = require('../errors/migrate/MigrationResolverRulesError')
const RollbackLimitError = require('../errors/migrate/RollbackLimitError')
const RollbackUnavailableError = require('../errors/migrate/RollbackUnavailableError')

const META_ID = '1715865523-create-coko-server-meta.js'

// #region umzug
const resolveRelative = m => require.resolve(m, { paths: [process.cwd()] })

const tryRequireRelative = componentPath => {
  try {
    /* eslint-disable-next-line import/no-dynamic-require, global-require */
    const component = require(require.resolve(componentPath, {
      paths: [process.cwd()],
    }))

    return component
  } catch (e) {
    throw new Error(
      `Unable to load component ${componentPath} on the server. ${e}`,
    )
  }
}

// componentPath could be a path or the name of a node module
const getMigrationPaths = () => {
  const migrationPaths = []

  const getPathsRecursively = componentPath => {
    const component = tryRequireRelative(componentPath)

    const migrationsPath = path.resolve(
      path.dirname(resolveRelative(componentPath)),
      'migrations',
    )

    if (fs.existsSync(migrationsPath)) {
      migrationPaths.push(migrationsPath)
    }

    if (component.extending) {
      getPathsRecursively(component.extending)
    }
  }

  if (config.has('pubsweet.components')) {
    config.get('pubsweet.components').forEach(componentPath => {
      getPathsRecursively(componentPath)
    })
  }

  migrationPaths.push(path.resolve(__dirname, 'coreMigrations'))

  return migrationPaths
}

const getGlobPattern = () => {
  const migrationPaths = getMigrationPaths()

  const pattern = migrationPaths
    .map(migrationPath => `${migrationPath}/*.{js,sql}`)
    .join(',')

  return `{${pattern}}`
}

const customStorage = {
  logMigration: async migration => migrations.logMigration(migration.name),
  unlogMigration: async migration => migrations.unlogMigration(migration.name),

  executed: async () => {
    await migrations.createTable()
    const rows = await migrations.getRows()
    return rows.map(row => row.id)
  },
}

const getTimestampFromName = migrationName => {
  const migrationUnixTimestampStr = migrationName.split('-')[0]
  const migrationUnixTimestamp = parseInt(migrationUnixTimestampStr, 10)
  return migrationUnixTimestamp
}

const isMigrationAfterThreshold = (migrationName, threshold) => {
  if (!threshold) return false // table hasn't been created yet, so no restrictions yet
  const migrationUnixTimestamp = getTimestampFromName(migrationName)
  return migrationUnixTimestamp > threshold
}

/**
 * Any positive integer is a valid unix timestamp, might wanna switch to umzug's
 * filename convention further down the line for robustness.
 *
 * The current setup will work as long as the date is not less 1000000000 (some time in 2001).
 */
const isUnixTimestamp = input => {
  return Number.isInteger(input) && input >= 1000000000 && input <= 9999999999
}

const doesMigrationFilenameStartWithUnixTimestamp = migrationName => {
  const timestamp = getTimestampFromName(migrationName)
  return isUnixTimestamp(timestamp)
}

const customResolver = (params, threshold) => {
  const { name, path: filePath } = params
  const isSql = extname(filePath) === '.sql'
  const isPastThreshold = isMigrationAfterThreshold(name, threshold)

  if (!doesMigrationFilenameStartWithUnixTimestamp(name)) {
    throw new MigrationResolverRulesError(
      `Migration files must start with a unix timestamp larger than 1000000000, followed by a dash (-)`,
      name,
    )
  }

  if (isPastThreshold) {
    if (isSql) {
      throw new MigrationResolverRulesError(
        `Migration files must be js files. Use knex.raw if you need to write sql code`,
        name,
      )
    }
  }

  if (isSql) {
    return {
      name,
      up: async database => {
        const fileContents = await fs.readFile(filePath, 'utf-8')
        return database.raw(fileContents)
      },
    }
  }

  /* eslint-disable-next-line import/no-dynamic-require, global-require */
  const migration = require(filePath)

  if (isPastThreshold) {
    if (!migration.down || !isFunction(migration.down)) {
      throw new MigrationResolverRulesError(
        `All migrations need to define a down function so that the migration can be rolled back`,
        name,
      )
    }
  }

  return {
    name,
    up: async () => migration.up(db),
    down: async () => migration.down(db),
  }
}

const getUmzug = threshold => {
  const globPattern = getGlobPattern()

  const parent = new Umzug({
    migrations: {
      glob: globPattern,
      resolve: params => customResolver(params, threshold),
    },
    storage: customStorage,
    logger,
  })

  const umzug = new Umzug({
    ...parent.options,
    migrations: async ctx => {
      const parentMigrations = await parent.migrations()
      const sortedMigrations = sortBy(parentMigrations, 'name')

      return sortedMigrations
    },
  })

  return umzug
}
// #endregion umzug

// #region helpers
const getMetaCreatedAsUnixTimestamp = async () => {
  if (!(await meta.exists())) return null
  const data = meta.getData()

  const createdDateAsUnixTimestamp = Math.floor(
    new Date(data.created).getTime() / 1000,
  )

  return createdDateAsUnixTimestamp
}

const updateCheckpoint = async () => {
  if (!(await meta.exists())) {
    logger.info(
      'Migrate: Coko server meta table does not exist! Not updating last successful migrate checkpoint',
    )
    return
  }

  logger.info('Migrate: Last successful migrate checkpoint: updating')

  const lastMigration = await migrations.getLastMigration()
  await meta.setCheckpoint(lastMigration)

  logger.info('Migrate: Last successful migrate checkpoint: updated')
}
// #endregion helpers

// #region commands
/**
 * After installing v4, some rules will apply for migrations, but only for new
 * migrations, so that developers don't have to rewrite all existing migrations.
 *
 * The threshold represents from which point in time forward the rules will
 * apply (the creation of the meta table, ie. from the moment they upgraded to
 * coko server v4).
 */
const migrate = async options => {
  const threshold = await getMetaCreatedAsUnixTimestamp()
  const umzug = getUmzug(threshold)

  const { skipLast, ...otherOptions } = options

  if (skipLast || Number.isNaN(skipLast)) {
    if (!Number.isInteger(skipLast) || skipLast <= 0) {
      throw new MigrateOptionIntegrityError(
        'Skip value must be a positive integer.',
      )
    }

    const pending = await umzug.pending()

    if (pending.length === 0) {
      throw new MigrateSkipLimitError('There are no pending migrations.')
    }

    if (skipLast === pending.length) {
      throw new MigrateSkipLimitError(
        'Skip value equals number of pending migrations. There is nothing to migrate.',
      )
    }

    if (skipLast > pending.length) {
      throw new MigrateSkipLimitError(
        'Skip value exceeds number of pending migrations.',
        pending.length - 1,
      )
    }

    const runTo = pending[pending.length - 1 - skipLast].name
    await umzug.up({ to: runTo })
  } else {
    await umzug.up(otherOptions)
  }

  logger.info('Migrate: All migrations ran successfully!')
  await updateCheckpoint()
}

const rollback = async options => {
  if (!(await meta.exists())) throw new RollbackUnavailableError()

  const migrationRows = await migrations.getRows()
  const metaPosition = migrationRows.findIndex(item => item.id === META_ID)
  const metaIsLast = metaPosition === migrationRows.length - 1

  if (metaIsLast) {
    throw new RollbackLimitError('No migrations have run after the upgrade.', {
      metaLimit: true,
    })
  }

  const downOptions = {}
  const checkpoint = await meta.getCheckpoint()

  if (!options.lastSuccessfulRun) {
    const maximum = migrationRows.length - 1 - metaPosition
    const stepTooFar = (options.step || 1) > maximum

    if (stepTooFar) {
      throw new RollbackLimitError(
        `Maximum steps value for the current state of the migration table is ${maximum}.`,
        { metaLimit: true },
      )
    }

    if (options.step && options.step > 1) downOptions.step = options.step
  } else {
    const checkpointPosition = migrationRows.findIndex(
      item => item.id === checkpoint,
    )

    const checkpointTooFar = checkpointPosition <= metaPosition

    if (checkpointTooFar) {
      throw new RollbackLimitError(
        `Check that the checkpoint in the coko_server_meta table in your database is a migration that ran after ${META_ID}`,
        { metaLimit: true },
      )
    }

    /**
     * The 'to' option is inclusive, ie. it will revert all migrations,
     * INCLUDING the one specified. We want to roll back up to, but not
     * including the specified migration. So we find the one right after.
     */
    if (migrationRows.length - 1 === checkpointPosition) {
      throw new RollbackLimitError(
        'No migrations have completed successfully since the last checkpoint. There is nothing to revert.',
      )
    }

    const revertTo = migrationRows[checkpointPosition + 1].id

    downOptions.to = revertTo
  }

  // If we don't clear the checkpoint, we get a reference error, as the checkpoint
  // is a foreign key to the migrations id column
  await meta.clearCheckpoint()

  try {
    const umzug = getUmzug()
    await umzug.down(downOptions)
    logger.info('Migrate: Migration rollback successful!')
  } catch (e) {
    logger.error(e)

    // Restore original cleared checkpoint
    if (checkpoint) await meta.setCheckpoint(checkpoint)

    throw e
  }

  await updateCheckpoint()
}

const pending = async () => {
  const umzug = getUmzug()
  const pendingMigrations = await umzug.pending()

  if (pendingMigrations.length === 0) {
    logger.info('Migrate: There are no pending migrations.')
  } else {
    logger.info(`Migrate: Pending migrations:`)
    logger.info(pendingMigrations)
  }
}

const executed = async () => {
  const umzug = getUmzug()
  const executedMigrations = await umzug.executed()

  if (executedMigrations.length === 0) {
    logger.info('Migrate: There are no executed migrations.')
  } else {
    logger.info(`Migrate: Executed migrations:`)
    logger.info(executedMigrations)
  }
}
// #endregion commmands

module.exports = { migrate, rollback, pending, executed }

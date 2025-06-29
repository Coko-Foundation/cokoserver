const fs = require('fs')
const path = require('path')
const { extname } = require('path')
const config = require('config')
const { Umzug } = require('umzug')
const sortBy = require('lodash/sortBy')
const isFunction = require('lodash/isFunction')

const {
  logTask,
  logTaskItem,
  logSuccess,
  logErrorTask,
  logSuccessTask,
} = require('../logger/internals')

const logger = require('../logger')
const db = require('./db')
const { migrations, meta } = require('./migrateDbHelpers')
const tryRequireRelative = require('../utils/tryRequireRelative')

const MigrateOptionIntegrityError = require('./errors/MigrateOptionIntegrityError')
const MigrateSkipLimitError = require('./errors/MigrateSkipLimitError')
const MigrationResolverRulesError = require('./errors/MigrationResolverRulesError')
const RollbackLimitError = require('./errors/RollbackLimitError')
const RollbackUnavailableError = require('./errors/RollbackUnavailableError')

const META_ID = '1715865523-create-coko-server-meta.js'

// #region umzug
const resolveRelative = m => require.resolve(m, { paths: [process.cwd()] })

// componentPath could be a path or the name of a node module
const getMigrationPaths = passedConfig => {
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

  if (passedConfig.has('components')) {
    passedConfig.get('components').forEach(componentPath => {
      getPathsRecursively(componentPath)
    })
  }

  migrationPaths.push(path.resolve(__dirname, 'coreMigrations'))

  return migrationPaths
}

const getGlobPattern = passedConfig => {
  const migrationPaths = getMigrationPaths(passedConfig)

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
      up: async () => {
        const fileContents = fs.readFileSync(filePath).toString()
        return db.raw(fileContents)
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

const getUmzug = (passedConfig, threshold) => {
  const globPattern = getGlobPattern(passedConfig)

  const parent = new Umzug({
    migrations: {
      glob: globPattern,
      resolve: params => customResolver(params, threshold),
    },
    storage: customStorage,
    logging: false,
  })

  const umzug = new Umzug({
    ...parent.options,
    migrations: async ctx => {
      const parentMigrations = await parent.migrations()
      const sortedMigrations = sortBy(parentMigrations, 'name')

      return sortedMigrations
    },
  })

  umzug.on('migrating', e => logger.info(`Migrating ${e.name}`))
  umzug.on('migrated', (e, f) =>
    logSuccess(`Successfully migrated ${e.name}\n`),
  )

  umzug.on('reverting', e => logger.info(`Reverting ${e.name}`))
  umzug.on('reverted', (e, f) =>
    logSuccess(`Successfully reverted ${e.name}\n`),
  )

  return umzug
}
// #endregion umzug

// #region helpers
const getMetaCreatedAsUnixTimestamp = async () => {
  if (!(await meta.exists())) return null
  const data = await meta.getData()

  const createdDateAsUnixTimestamp = Math.floor(
    new Date(data.created).getTime() / 1000,
  )

  return createdDateAsUnixTimestamp
}

const updateCheckpoint = async () => {
  const baseMsg = 'Last successful migrate checkpoint:'

  if (!(await meta.exists())) {
    logErrorTask(
      `Coko server meta table does not exist! Not updating last successful migrate checkpoint`,
    )
    return
  }

  const lastMigration = await migrations.getLastMigration()
  const currentCheckpoint = await meta.getCheckpoint()

  if (lastMigration === currentCheckpoint) {
    logTaskItem(`${baseMsg} Checkpoint already at latest migration.`)
    logTaskItem(`${baseMsg} Performing no operation.`)
    return
  }

  logTaskItem(`${baseMsg} updating`)

  await meta.setCheckpoint(lastMigration)

  logTaskItem(`${baseMsg} updated`)
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
const migrate = async (passedConfig, options = {}) => {
  logTask(`Run migrations`)

  const threshold = await getMetaCreatedAsUnixTimestamp()
  const umzug = getUmzug(passedConfig, threshold)

  const { skipLast, ...otherOptions } = options

  const isSkipLastDefined =
    typeof skipLast !== 'undefined' && !Number.isNaN(skipLast)

  if (isSkipLastDefined) {
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

  logSuccessTask('All migrations ran successfully!')
  await updateCheckpoint()
}

const rollback = async (passedConfig, options = {}) => {
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
    const umzug = getUmzug(passedConfig)
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

const pending = async passedConfig => {
  const umzug = getUmzug(passedConfig)
  const pendingMigrations = await umzug.pending()

  if (pendingMigrations.length === 0) {
    logger.info('Migrate: There are no pending migrations.')
  } else {
    logger.info(`Migrate: Pending migrations:`)
    logger.info(pendingMigrations)
  }

  return pendingMigrations
}

const executed = async passedConfig => {
  const umzug = getUmzug(passedConfig)
  const executedMigrations = await umzug.executed()

  if (executedMigrations.length === 0) {
    logger.info('Migrate: There are no executed migrations.')
  } else {
    logger.info(`Migrate: Executed migrations:`)
    logger.info(executedMigrations)
  }

  return executedMigrations
}
// #endregion commmands

const migrationManager = {
  migrate: async options => migrate(config, options),
  rollback: async options => rollback(config, options),
  pending: async () => pending(config),
  executed: async () => executed(config),
}

module.exports = { migrate, rollback, pending, executed, migrationManager }

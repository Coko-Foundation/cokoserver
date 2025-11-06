import {
  logTask,
  logTaskItem,
  logErrorTask,
  logSuccessTask,
} from '../logger/internals'

import config from '../configManager/config'
import logger from '../logger'
import { migrations, migrationsMeta } from './migrateDbHelpers'

import MigrateOptionIntegrityError from './errors/MigrateOptionIntegrityError'
import MigrateSkipLimitError from './errors/MigrateSkipLimitError'
import RollbackLimitError from './errors/RollbackLimitError'
import RollbackUnavailableError from './errors/RollbackUnavailableError'

import MigrationRunner from './migrationRunner'

export type UpOptions = {
  skipLast?: number
  step?: number
}

const META_ID = '1715865523-create-coko-server-meta.js'

// #region helpers
const updateCheckpoint = async () => {
  const baseMsg = 'Last successful migrate checkpoint:'

  if (!(await migrationsMeta.exists())) {
    logErrorTask(
      `Coko server meta table does not exist! Not updating last successful migrate checkpoint`,
    )
    return
  }

  const lastMigration = await migrations.getLastMigration()
  const currentCheckpoint = await migrationsMeta.getCheckpoint()

  if (lastMigration === currentCheckpoint) {
    logTaskItem(`${baseMsg} Checkpoint already at latest migration.`)
    logTaskItem(`${baseMsg} Performing no operation.`)
    return
  }

  logTaskItem(`${baseMsg} updating`)

  await migrationsMeta.setCheckpoint(lastMigration)

  logTaskItem(`${baseMsg} updated`)
}
// #endregion helpers

// #region commands
export const migrate = async (
  passedConfig,
  options: UpOptions = {},
): Promise<void> => {
  logTask(`Run migrations`)

  const migrationRunner = new MigrationRunner(passedConfig.get('components'))
  await migrationRunner.init()

  const { skipLast, ...otherOptions } = options

  const isSkipLastDefined =
    typeof skipLast !== 'undefined' && !Number.isNaN(skipLast)

  if (isSkipLastDefined) {
    if (!Number.isInteger(skipLast) || skipLast <= 0) {
      throw new MigrateOptionIntegrityError(
        'Skip value must be a positive integer.',
      )
    }

    const pending = await migrationRunner.pending()

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
    await migrationRunner.up({ to: runTo })
  } else {
    await migrationRunner.up(otherOptions)
  }

  logSuccessTask('All migrations ran successfully!')
  await updateCheckpoint()
}

export const rollback = async (passedConfig, options = {}) => {
  if (!(await migrationsMeta.exists())) throw new RollbackUnavailableError()

  const migrationRows = await migrations.getRows()
  const metaPosition = migrationRows.findIndex(item => item.id === META_ID)
  const metaIsLast = metaPosition === migrationRows.length - 1

  if (metaIsLast) {
    throw new RollbackLimitError('No migrations have run after the upgrade.', {
      metaLimit: true,
    })
  }

  const downOptions = {}
  const checkpoint = await migrationsMeta.getCheckpoint()

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
  await migrationsMeta.clearCheckpoint()

  try {
    const umzug = await getUmzug(passedConfig)
    await umzug.down(downOptions)
    logger.info('Migrate: Migration rollback successful!')
  } catch (e) {
    logger.error(e)

    // Restore original cleared checkpoint
    if (checkpoint) await migrationsMeta.setCheckpoint(checkpoint)

    throw e
  }

  await updateCheckpoint()
}

export const pending = async passedConfig => {
  const umzug = await getUmzug(passedConfig)
  const pendingMigrations = await umzug.pending()

  if (pendingMigrations.length === 0) {
    logger.info('Migrate: There are no pending migrations.')
  } else {
    logger.info(`Migrate: Pending migrations:`)
    logger.info(pendingMigrations)
  }

  return pendingMigrations
}

export const executed = async passedConfig => {
  const umzug = await getUmzug(passedConfig)
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

export const migrationManager = {
  migrate: async (options?: UpOptions): Promise<void> => {
    await migrate(config, options)
  },
  rollback: async (options): Promise<void> => rollback(config, options),
  pending: async () => pending(config),
  executed: async () => executed(config),
}

import { MigrationMeta, MigrateUpOptions, MigrateDownOptions } from 'umzug'

import internalLogger from '../logger/internals'

import config from '../configManager/config'
import logger from '../logger'
import { migrations, migrationsMeta } from './migrateDbHelpers'

import MigrateOptionIntegrityError from './errors/MigrateOptionIntegrityError'
import MigrateSkipLimitError from './errors/MigrateSkipLimitError'
import RollbackLimitError from './errors/RollbackLimitError'
import RollbackUnavailableError from './errors/RollbackUnavailableError'

import MigrationRunner from './migrationRunner'

type UpExtension = {
  skipLast?: number
}

export type MigrateOptions = MigrateUpOptions & UpExtension

type DownExtension = {
  lastSuccessfulRun?: boolean
}

export type RollbackOptions = MigrateDownOptions & DownExtension

const META_ID = '1715865523-create-coko-server-meta'

// #region helpers
const updateCheckpoint = async (): Promise<void> => {
  const baseMsg = 'Last successful migrate checkpoint:'

  if (!(await migrationsMeta.exists())) {
    internalLogger.error(
      `Coko server meta table does not exist! Not updating last successful migrate checkpoint`,
    )
    return
  }

  const lastMigration = await migrations.getLastMigration()
  const currentCheckpoint = await migrationsMeta.getCheckpoint()

  if (lastMigration === currentCheckpoint) {
    internalLogger.point(`${baseMsg} Checkpoint already at latest migration.`)
    internalLogger.point(`${baseMsg} Performing no operation.`)
    return
  }

  internalLogger.point(`${baseMsg} updating`)

  await migrationsMeta.setCheckpoint(lastMigration)

  internalLogger.point(`${baseMsg} updated`)
}
// #endregion helpers

// #region commands
export const migrate = async (
  passedConfig,
  options: MigrateOptions = {},
): Promise<void> => {
  internalLogger.section(`Run migrations`)

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

  internalLogger.success('All migrations ran successfully!')
  await updateCheckpoint()
}

export const rollback = async (
  passedConfig,
  options: RollbackOptions = {},
): Promise<void> => {
  if (!(await migrationsMeta.exists())) throw new RollbackUnavailableError()

  const migrationRows = await migrations.getRows()

  const metaPosition = migrationRows.findIndex(
    item => MigrationRunner.stripMigrationExtensionName(item.id) === META_ID,
  )

  const metaIsLast = metaPosition === migrationRows.length - 1

  if (metaIsLast) {
    throw new RollbackLimitError('No migrations have run after the upgrade.', {
      metaLimit: true,
    })
  }

  const downOptions = { ...options }

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

  /**
   * If we don't clear the checkpoint, we get a reference error, as the
   * checkpoint is a foreign key to the migrations id column.
   */
  await migrationsMeta.clearCheckpoint()

  try {
    const migrationRunner = new MigrationRunner(passedConfig.get('components'))
    await migrationRunner.init()
    await migrationRunner.down(downOptions)
    await updateCheckpoint()
    logger.info('Migrate: Migration rollback successful!')
  } catch (e) {
    // Restore original cleared checkpoint
    if (checkpoint) await migrationsMeta.setCheckpoint(checkpoint)

    logger.error(e)
    throw e
  }
}

export const pending = async (passedConfig): Promise<MigrationMeta[]> => {
  const migrationRunner = new MigrationRunner(passedConfig.get('components'))
  await migrationRunner.init()
  const pendingMigrations = await migrationRunner.pending()

  if (pendingMigrations.length === 0) {
    logger.info('Migrate: There are no pending migrations.')
  } else {
    logger.info(`Migrate: Pending migrations:`)
    logger.info(pendingMigrations)
  }

  return pendingMigrations
}

export const executed = async (passedConfig): Promise<MigrationMeta[]> => {
  const migrationRunner = new MigrationRunner(passedConfig.get('components'))
  await migrationRunner.init()
  const executedMigrations = await migrationRunner.executed()

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
  migrate: async (options?: MigrateOptions): Promise<void> => {
    await migrate(config, options)
  },

  rollback: async (options?: RollbackOptions): Promise<void> => {
    await rollback(config, options)
  },

  pending: async (): Promise<MigrationMeta[]> => pending(config),
  executed: async (): Promise<MigrationMeta[]> => executed(config),
}

import { Knex } from 'knex'

import MigrationRunner from '../migrationRunner'

const MIGRATIONS_TABLE = 'migrations'
const META_TABLE = 'coko_server_meta'

export async function up(db: Knex): Promise<void> {
  const migrationRows = await db.table(MIGRATIONS_TABLE)

  await db.transaction(async trx => {
    // The checkpoint is a FK to migrations.id — clear it before renaming rows
    const metaExists = await db.schema.hasTable(META_TABLE)
    let checkpoint: string | null = null

    if (metaExists) {
      const meta = await db(META_TABLE)
        .select('last_successful_migrate_checkpoint')
        .first()
        .transacting(trx)
      checkpoint = meta && meta.last_successful_migrate_checkpoint

      if (checkpoint) {
        await db(META_TABLE)
          .update({ last_successful_migrate_checkpoint: null })
          .transacting(trx)
      }
    }

    await Promise.all(
      migrationRows.map(async row => {
        const filename = MigrationRunner.stripMigrationExtensionName(row.id)

        await db(MIGRATIONS_TABLE)
          .where({ id: row.id })
          .update({ id: filename })
          .transacting(trx)
      }),
    )

    // Restore checkpoint with extension stripped
    if (metaExists && checkpoint) {
      const strippedCheckpoint =
        MigrationRunner.stripMigrationExtensionName(checkpoint)
      await db(META_TABLE)
        .update({ last_successful_migrate_checkpoint: strippedCheckpoint })
        .transacting(trx)
    }
  })
}

export async function down(): Promise<void> {
  /**
   * There's no coming back, as once the extension is removed, we don't know
   * what extension to revert back to.
   */
}

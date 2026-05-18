import { Knex } from 'knex'

import MigrationRunner from '../migrationRunner'
import { migrationsMeta } from '../migrateDbHelpers'

const MIGRATIONS_TABLE = 'migrations'

export async function up(db: Knex): Promise<void> {
  const migrationRows = await db.table(MIGRATIONS_TABLE)

  const metaExists = await migrationsMeta.exists()
  let checkpoint: string | null = null

  if (metaExists) {
    checkpoint = await migrationsMeta.getCheckpoint()
    if (checkpoint) await migrationsMeta.clearCheckpoint()
  }

  await db.transaction(async trx => {
    await Promise.all(
      migrationRows.map(async row => {
        const filename = MigrationRunner.stripMigrationExtensionName(row.id)

        await db(MIGRATIONS_TABLE)
          .where({ id: row.id })
          .update({ id: filename })
          .transacting(trx)
      }),
    )
  })

  if (metaExists && checkpoint) {
    await migrationsMeta.setCheckpoint(
      MigrationRunner.stripMigrationExtensionName(checkpoint),
    )
  }
}

export async function down(): Promise<void> {
  /**
   * There's no coming back, as once the extension is removed, we don't know
   * what extension to revert back to.
   */
}

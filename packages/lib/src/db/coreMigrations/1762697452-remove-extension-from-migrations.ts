import { Knex } from 'knex'

import MigrationRunner from '../migrationRunner'

const MIGRATIONS_TABLE = 'migrations'

export async function up(db: Knex): Promise<void> {
  const migrationRows = await db.table(MIGRATIONS_TABLE)

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
}

export async function down(): Promise<void> {
  /**
   * There's no coming back, as once the extension is removed, we don't know
   * what extension to revert back to.
   */
}

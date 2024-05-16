exports.up = async knex => {
  try {
    const tableExists = await knex.schema.hasTable('teams')

    if (!tableExists) {
      await knex.schema.createTable('teams', table => {
        table.uuid('id').primary()
        table
          .timestamp('created', { useTz: true })
          .notNullable()
          .defaultTo(knex.fn.now())
        table.timestamp('updated', { useTz: true })
        table.uuid('object_id')
        table.string('object_type')
        table.text('displayName').notNullable()
        table.text('role').notNullable()
        table.boolean('global').defaultTo(false)
        table.text('type').notNullable()
      })

      await knex.schema.raw(
        'CREATE UNIQUE INDEX "unique_global_team" ON "teams" (role) WHERE "global" = true;',
      )

      await knex.schema.raw(
        'CREATE UNIQUE INDEX "unique_non_global_team_per_object" ON "teams" (role, object_id) WHERE "global" = false;',
      )

      await knex.schema.raw(
        'ALTER TABLE "teams" ADD CONSTRAINT "global_teams_must_not_have_associated_objects_other_teams_must_have_them" CHECK ( (global = true AND object_id IS NULL AND object_type IS NULL) or (global = false AND object_id IS NOT NULL AND object_type IS NOT NULL));',
      )
      return true
    }

    const hasId = await knex.schema.hasColumn('teams', 'id')
    const hasCreated = await knex.schema.hasColumn('teams', 'created')
    const hasUpdated = await knex.schema.hasColumn('teams', 'updated')
    const hasObjectId = await knex.schema.hasColumn('teams', 'object_id')
    const hasObjectType = await knex.schema.hasColumn('teams', 'object_type')
    const hasDisplayName = await knex.schema.hasColumn('teams', 'display_name')
    const hasRole = await knex.schema.hasColumn('teams', 'role')
    const hasGlobal = await knex.schema.hasColumn('teams', 'global')
    const hasType = await knex.schema.hasColumn('teams', 'type')

    await knex.schema.alterTable('teams', table => {
      if (!hasId) {
        table.dropPrimary('teams_pkey')
        table.uuid('id').primary()
      }

      if (!hasCreated) {
        table
          .timestamp('created', { useTz: true })
          .notNullable()
          .defaultTo(knex.fn.now())
      }

      if (!hasUpdated) {
        table.timestamp('updated', { useTz: true })
      }

      if (!hasObjectId) {
        table.uuid('object_id')
      }

      if (!hasObjectType) {
        table.string('object_type')
      }

      if (!hasDisplayName) {
        table.text('displayName').notNullable()
      }

      if (!hasRole) {
        table.text('role').notNullable()
      }

      if (!hasGlobal) {
        table.boolean('global').defaultTo(false)
      }

      if (!hasType) {
        table.text('type').notNullable()
      }
    })

    await knex.schema.raw(
      'CREATE UNIQUE INDEX IF NOT EXISTS "unique_global_team" ON "teams" (role) WHERE "global" = true;',
    )

    await knex.schema.raw(
      'CREATE UNIQUE INDEX IF NOT EXISTS "unique_non_global_team_per_object" ON "teams" (role, object_id) WHERE "global" = false;',
    )

    await knex.schema.raw(
      `ALTER TABLE "teams" DROP CONSTRAINT IF EXISTS "global_teams_must_not_have_associated_objects_other_teams_must_have_them";
      ALTER TABLE "teams" ADD CONSTRAINT "global_teams_must_not_have_associated_objects_other_teams_must_have_them" CHECK ( (global = true AND object_id IS NULL AND object_type IS NULL) or (global = false AND object_id IS NOT NULL AND object_type IS NOT NULL));`,
    )
    return true
  } catch (e) {
    throw new Error(`Teams: Initial: Migration failed! ${e}`)
  }
}

exports.down = knex => {
  return knex.schema.dropTable('teams')
}

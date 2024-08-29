exports.up = async knex => {
  try {
    const tableExists = await knex.schema.hasTable('team_members')

    if (!tableExists) {
      await knex.schema.createTable('team_members', table => {
        table.uuid('id').primary()
        table.timestamp('created').defaultTo(knex.fn.now())
        table.timestamp('updated').defaultTo(knex.fn.now())
        table.string('status')
        table
          .uuid('team_id')
          .notNullable()
          .references('id')
          .inTable('teams')
          .onDelete('CASCADE')
          .onUpdate('CASCADE')
        table
          .uuid('user_id')
          .notNullable()
          .references('id')
          .inTable('users')
          .onDelete('CASCADE')
          .onUpdate('CASCADE')
        table.unique(['team_id', 'user_id'])
      })
      return true
    }

    const hasId = await knex.schema.hasColumn('team_members', 'id')
    const hasCreated = await knex.schema.hasColumn('team_members', 'created')
    const hasUpdated = await knex.schema.hasColumn('team_members', 'updated')
    const hasStatus = await knex.schema.hasColumn('team_members', 'status')
    const hasTeamId = await knex.schema.hasColumn('team_members', 'team_id')
    const hasUserId = await knex.schema.hasColumn('team_members', 'user_id')

    await knex.schema.alterTable('team_members', table => {
      if (!hasId) {
        table.dropPrimary('team_members_pkey')
        table.uuid('id').primary()
      }

      if (!hasCreated) {
        table.timestamp('created').defaultTo(knex.fn.now())
      }

      if (!hasUpdated) {
        table.timestamp('updated').defaultTo(knex.fn.now())
      }

      if (!hasStatus) {
        table.string('status')
      }

      if (!hasTeamId) {
        table.dropForeign('team_id')
        table
          .uuid('team_id')
          .notNullable()
          .references('id')
          .inTable('teams')
          .onDelete('CASCADE')
          .onUpdate('CASCADE')
      }

      if (!hasUserId) {
        table.dropForeign('user_id')
        table
          .uuid('user_id')
          .notNullable()
          .references('id')
          .inTable('users')
          .onDelete('CASCADE')
          .onUpdate('CASCADE')
      }
    })

    await knex.schema.raw(
      'CREATE UNIQUE INDEX IF NOT EXISTS "team_members_team_id_user_id_unique" ON "team_members" (team_id, user_id);',
    )
    return true
  } catch (e) {
    throw new Error(`Team Members: Initial: Migration failed! ${e}`)
  }
}

exports.down = knex => {
  return knex.schema.dropTable('team_members')
}

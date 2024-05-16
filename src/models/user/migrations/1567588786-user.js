exports.up = async knex => {
  try {
    const tableExists = await knex.schema.hasTable('users')

    if (!tableExists) {
      await knex.schema.createTable('users', table => {
        table.uuid('id').primary()
        table
          .timestamp('created', { useTz: true })
          .notNullable()
          .defaultTo(knex.fn.now())
        table.timestamp('updated', { useTz: true })
        table.string('username')
        table.text('password_hash')
        table.text('password_reset_token')
        table.timestamp('password_reset_timestamp', { useTz: true })
        table.boolean('agreed_tc').notNullable().defaultTo(false)
        table.boolean('is_active').notNullable().defaultTo(false)
        table.text('invitation_token')
        table.timestamp('invitation_token_timestamp', { useTz: true })
        table.text('given_names')
        table.text('surname')
        table.text('title_pre')
        table.text('title_post')
        table.text('type').notNullable()
        table.unique('username')
      })
      return true
    }

    const hasId = await knex.schema.hasColumn('users', 'id')
    const hasCreated = await knex.schema.hasColumn('users', 'created')
    const hasUpdated = await knex.schema.hasColumn('users', 'updated')
    const hasUsername = await knex.schema.hasColumn('users', 'username')

    const hasPasswordHash = await knex.schema.hasColumn(
      'users',
      'password_hash',
    )

    const hasPasswordResetToken = await knex.schema.hasColumn(
      'users',
      'password_reset_token',
    )

    const hasPasswordResetTimestamp = await knex.schema.hasColumn(
      'users',
      'password_reset_timestamp',
    )

    const hasAgreedTC = await knex.schema.hasColumn('users', 'agreed_tc')
    const hasIsActive = await knex.schema.hasColumn('users', 'is_active')

    const hasInvitationToken = await knex.schema.hasColumn(
      'users',
      'invitation_token',
    )

    const hasInvitationTokenTimestamp = await knex.schema.hasColumn(
      'users',
      'invitation_token_timestamp',
    )

    const hasGivenNames = await knex.schema.hasColumn('users', 'given_names')
    const hasSurname = await knex.schema.hasColumn('users', 'surname')
    const hasTitlePre = await knex.schema.hasColumn('users', 'title_pre')
    const hasTitlePost = await knex.schema.hasColumn('users', 'title_post')
    const hasType = await knex.schema.hasColumn('users', 'type')

    await knex.schema.alterTable('users', table => {
      if (!hasId) {
        table.dropPrimary('users_pkey')
        table.uuid('id').primary()
      }

      if (!hasCreated) {
        table.timestamp('created').defaultTo(knex.fn.now())
      }

      if (!hasUpdated) {
        table.timestamp('updated').defaultTo(knex.fn.now())
      }

      if (!hasUsername) {
        table.string('username')
      }

      if (!hasPasswordHash) {
        table.text('password_hash')
      }

      if (!hasPasswordResetToken) {
        table.text('password_reset_token')
      }

      if (!hasPasswordResetTimestamp) {
        table.timestamp('password_reset_timestamp', { useTz: true })
      }

      if (!hasAgreedTC) {
        table.boolean('agreed_tc').notNullable().defaultTo(false)
      }

      if (!hasIsActive) {
        table.boolean('is_active').notNullable().defaultTo(false)
      }

      if (!hasInvitationToken) {
        table.text('invitation_token')
      }

      if (!hasInvitationTokenTimestamp) {
        table.timestamp('invitation_token_timestamp', { useTz: true })
      }

      if (!hasGivenNames) {
        table.text('given_names')
      }

      if (!hasSurname) {
        table.text('surname')
      }

      if (!hasTitlePre) {
        table.text('title_pre')
      }

      if (!hasTitlePost) {
        table.text('title_post')
      }

      if (!hasType) {
        table.text('type').notNullable()
      }
    })

    await knex.schema.raw(
      'CREATE UNIQUE INDEX IF NOT EXISTS "users_username_unique" ON "users" (username);',
    )
    return true
  } catch (e) {
    throw new Error(`Users: Initial: Migration failed! ${e}`)
  }
}

exports.down = async knex => {
  return knex.schema.dropTable('users')
}

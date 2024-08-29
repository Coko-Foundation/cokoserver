exports.up = async knex => {
  try {
    const tableExists = await knex.schema.hasTable('identities')

    if (!tableExists) {
      await knex.schema.createTable('identities', table => {
        table.uuid('id').primary()
        table
          .timestamp('created', { useTz: true })
          .notNullable()
          .defaultTo(knex.fn.now())
        table.timestamp('updated', { useTz: true })
        table.uuid('user_id').references('users.id').notNullable()
        table.text('type').notNullable()
        table.text('provider')
        table.text('oauthAccessToken')
        table.text('oauthRefreshToken')
        table.boolean('is_default').defaultTo(false)
        table.text('email').notNullable()
        table.boolean('is_verified').notNullable().defaultTo(false)
        table.boolean('is_social')
        table.jsonb('profile_data')
        table.text('verification_token')
        table.timestamp('verification_token_timestamp', { useTz: true })
        table.unique('email', 'unique_email')
        table.unique('verification_token', 'unique_verification_token')
      })

      await knex.schema.raw(
        ' CREATE UNIQUE INDEX "is_default_idx" ON "identities" (is_default, user_id) WHERE is_default IS true;',
      )

      return true
    }

    const hasId = await knex.schema.hasColumn('identities', 'id')
    const hasCreated = await knex.schema.hasColumn('identities', 'created')
    const hasUpdated = await knex.schema.hasColumn('identities', 'updated')
    const hasUserId = await knex.schema.hasColumn('identities', 'user_id')
    const hasProvider = await knex.schema.hasColumn('identities', 'provider')

    const hasOAuthAccessToken = await knex.schema.hasColumn(
      'identities',
      'oauth_access_token',
    )

    const hasOAuthRefreshToken = await knex.schema.hasColumn(
      'identities',
      'oauth_refresh_token',
    )

    const hasIsDefault = await knex.schema.hasColumn('identities', 'is_default')
    const hasEmail = await knex.schema.hasColumn('identities', 'email')

    const hasIsVerified = await knex.schema.hasColumn(
      'identities',
      'is_verified',
    )

    const hasIsSocial = await knex.schema.hasColumn('identities', 'is_social')

    const hasProfileData = await knex.schema.hasColumn(
      'identities',
      'profile_data',
    )

    const hasVerificationToken = await knex.schema.hasColumn(
      'identities',
      'verification_token',
    )

    const hasVerificationTokenTimestamp = await knex.schema.hasColumn(
      'identities',
      'verification_token_timestamp',
    )

    const hasType = await knex.schema.hasColumn('identities', 'type')

    await knex.schema.alterTable('identities', table => {
      if (!hasId) {
        table.dropPrimary('identities_pkey')
        table.uuid('id').primary()
      }

      if (!hasCreated) {
        table.timestamp('created').defaultTo(knex.fn.now())
      }

      if (!hasUpdated) {
        table.timestamp('updated').defaultTo(knex.fn.now())
      }

      if (!hasUserId) {
        table.dropForeign('user_id')
        table.uuid('user_id').references('users.id').notNullable()
      }

      if (!hasProvider) {
        table.text('provider')
      }

      if (!hasOAuthAccessToken) {
        table.text('oauthAccessToken')
      }

      if (!hasOAuthRefreshToken) {
        table.text('oauthRefreshToken')
      }

      if (!hasIsDefault) {
        table.boolean('is_default').defaultTo(false)
      }

      if (!hasEmail) {
        table.text('email').notNullable()
      }

      if (!hasIsVerified) {
        table.boolean('is_verified').notNullable().defaultTo(false)
      }

      if (!hasIsSocial) {
        table.boolean('is_social')
      }

      if (!hasProfileData) {
        table.jsonb('profile_data')
      }

      if (!hasVerificationToken) {
        table.text('verification_token')
      }

      if (!hasVerificationTokenTimestamp) {
        table.timestamp('verification_token_timestamp', { useTz: true })
      }

      if (!hasType) {
        table.text('type').notNullable()
      }
    })

    await knex.schema.raw(
      'CREATE UNIQUE INDEX IF NOT EXISTS unique_email ON identities (email);',
    )

    await knex.schema.raw(
      'CREATE UNIQUE INDEX IF NOT EXISTS unique_verification_token ON identities (verification_token);',
    )

    await knex.schema.raw(
      ' CREATE UNIQUE INDEX IF NOT EXISTS "is_default_idx" ON "identities" (is_default, user_id) WHERE is_default IS true;',
    )

    return true
  } catch (e) {
    throw new Error(`Identity: Initial: Migration failed! ${e}`)
  }
}

exports.down = async knex => {
  return knex.schema.dropTable('identities')
}

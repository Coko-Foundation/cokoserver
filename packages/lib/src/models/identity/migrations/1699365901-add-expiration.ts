export const up = async knex => {
  try {
    const tableExists = await knex.schema.hasTable('identities')
    if (!tableExists) throw new Error('Table identities does not exist!')

    const columns = [
      'oauth_access_token_expiration',
      'oauth_refresh_token_expiration',
    ]

    await Promise.all(
      columns.map(async column => {
        const columnExists = await knex.schema.hasColumn('identities', column)

        // If the column exists, make sure it works the same as the one we would have added
        if (columnExists) {
          let isSameStructure = false

          const { type, nullable, defaultValue } =
            await knex('identities').columnInfo(column)

          if (
            type === 'timestamp with time zone' &&
            nullable &&
            defaultValue === null
          ) {
            isSameStructure = true
          }

          if (!isSameStructure) {
            throw new Error(
              'Column exists but has different structure than expected!',
            )
          }

          return true
        }

        await knex.schema.table('identities', table => {
          table.timestamp(column, { useTz: true }).nullable().defaultTo(null)
        })

        return true
      }),
    )
  } catch (e) {
    throw new Error(
      `Migration: Identity: creating oauthAccessTokenExpiration and oauthRefreshTokenExpiration and setting them to default false failed ${e}`,
    )
  }
}

export const down = async knex => {
  try {
    return knex.schema.table('identities', table => {
      table.dropColumn('oauthAccessTokenExpiration')
      table.dropColumn('oauthRefreshTokenExpiration')
    })
  } catch (e) {
    throw new Error(
      `Migration: Identity: removing oauthAccessTokenExpiration and oauthRefreshTokenExpiration columns failed ${e}`,
    )
  }
}

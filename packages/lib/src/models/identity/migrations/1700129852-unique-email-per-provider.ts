import { Knex } from 'knex'

export const up = async (knex: Knex): Promise<void> => {
  try {
    await knex.schema.alterTable('identities', table => {
      table.dropUnique(['email'], 'unique_email')
    })

    await knex.raw(
      'ALTER TABLE identities ADD CONSTRAINT unique_provider_email UNIQUE (provider, email);',
    )
  } catch (e) {
    throw new Error(
      `Migration: Identity: require unique email per provider failed ${e}`,
    )
  }
}

export const down = async (knex: Knex): Promise<void> => {
  try {
    await knex.schema.alterTable('identities', table => {
      table.dropUnique(['provider', 'email'], 'unique_provider_email')
    })

    await knex.raw(
      'ALTER TABLE identities ADD CONSTRAINT unique_email UNIQUE (email);',
    )
  } catch (e) {
    throw new Error(`Migration: Identity: require unique email failed ${e}`)
  }
}

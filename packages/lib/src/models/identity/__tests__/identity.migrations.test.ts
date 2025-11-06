import { describe, beforeEach, afterAll, it, expect } from 'vitest'
import { db, migrationManager } from '../../../db'
import subscriptionManager from '../../../graphql/pubsub'

import User from '../../user/user.model'
import Identity from '../identity.model'

describe('Identity migrations', () => {
  beforeEach(async () => {
    const tables = await db('pg_tables')
      .select('tablename')
      .where('schemaname', 'public')

    for (const t of tables) {
      /* eslint-disable-next-line no-await-in-loop */
      await db.raw(`DROP TABLE IF EXISTS public.${t.tablename} CASCADE`)
    }
  })

  afterAll(async () => {
    await db.destroy()
    await subscriptionManager.client.end()
  })

  it('adds an on delete and on update cascade on the user id column', async () => {
    await migrationManager.migrate({ to: '1716032346-drop-entities.js' })

    const user = await User.insert({})

    await Identity.insert({
      userId: user.id,
      email: 'user@example.com',
    })

    // cannot delete because it violates a foreign key constraint
    await expect(User.deleteById(user.id)).rejects.toThrow()

    await migrationManager.migrate({ step: 1 })

    // deleting succeeds and identity is removed
    await User.deleteById(user.id)
    const identities = await Identity.find({})
    expect(identities.totalCount).toBe(0)

    // test rollback
    const anotherUser = await User.insert({})

    await Identity.insert({
      userId: anotherUser.id,
      email: 'anotheruser@example.com',
    })

    await migrationManager.rollback({ step: 1 })

    await expect(User.deleteById(anotherUser.id)).rejects.toThrow()
  })
})

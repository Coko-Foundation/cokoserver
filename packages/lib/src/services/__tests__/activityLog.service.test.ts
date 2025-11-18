import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import activityLog from '../activityLog'

import { createUser } from '../../models/__tests__/helpers/users'
import clearDb from '../../models/_helpers/clearDb'
import ActivityLog from '../../models/activityLog/activityLog.model'
import { actionTypes } from '../../models/activityLog/constants'
import { db, migrationManager } from '../../db'
import config from '../../configManager/config'

describe('Activity Log Service', () => {
  beforeAll(async () => {
    config.reset()
    await config.init({
      components: [
        'src/models/user',
        'src/models/identity',
        'src/models/activityLog',
      ],
    })

    await migrationManager.migrate()
  })

  beforeEach(async () => {
    await clearDb()
  })

  afterAll(async () => {
    config.reset()
    await db.destroy()
  })

  it('creates a log entry', async () => {
    const actor = await createUser()
    const dummyUser = await createUser()

    const log = await activityLog({
      actorId: actor.id,
      actionType: actionTypes.CREATE,
      message: 'create a new user',
      valueAfter: dummyUser,
      affectedObjects: [{ id: dummyUser.id, objectType: 'user' }],
    })

    const { result: activities } = await ActivityLog.find({})
    expect(log).toBeDefined()
    expect(activities).toHaveLength(1)
  })
})

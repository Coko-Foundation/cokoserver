import activityLog from '../activityLog'

import { createUser } from '../../models/__tests__/helpers/users'
import clearDb from '../../models/_helpers/clearDb'
import ActivityLog from '../../models/activityLog/activityLog.model'
import { actionTypes } from '../../models/activityLog/constants'
import { db } from '../../db'

describe('Activity Log Service', () => {
  beforeEach(async () => {
    await clearDb()
  })

  afterAll(async () => {
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

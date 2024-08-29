const activityLog = require('../activityLog')

const { createUser } = require('../../models/__tests__/helpers/users')
const clearDb = require('../../models/__tests__/_clearDb')
const ActivityLog = require('../../models/activityLog/activityLog.model')
const { actionTypes } = require('../../models/activityLog/constants')
const { db } = require('../../db')

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

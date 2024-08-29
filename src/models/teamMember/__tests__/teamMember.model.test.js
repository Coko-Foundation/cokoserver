const { v4: uuid } = require('uuid')

const { db, migrationManager } = require('../../../db')
const subscriptionManager = require('../../../graphql/pubsub')
const clearDb = require('../../__tests__/_clearDb')

const User = require('../../user/user.model')
const Team = require('../../team/team.model')
const TeamMember = require('../teamMember.model')

describe('Team Member Model', () => {
  beforeAll(async () => {
    await migrationManager.migrate()
  })

  beforeEach(async () => {
    await clearDb()
  })

  afterAll(async () => {
    await db.destroy()
    await subscriptionManager.client.end()
  })

  it('can have a status', async () => {
    const team = await Team.insert({
      role: 'author',
      displayName: 'Author',
      objectId: uuid(),
      objectType: 'unknownObject',
    })

    const user = await User.insert({})

    const tm = await TeamMember.insert({
      teamId: team.id,
      userId: user.id,
      status: 'someStatus',
    })

    expect(tm.status).toEqual('someStatus')
  })

  it('deletes team members when a team is deleted', async () => {
    const team = await Team.insert({
      role: 'editor',
      displayName: 'Editor',
      global: true,
    })

    const userOne = await User.insert({})
    const userTwo = await User.insert({})

    await Team.addMember(team.id, userOne.id)
    await Team.addMember(team.id, userTwo.id)

    const members = await TeamMember.find({
      teamId: team.id,
    })

    expect(members.totalCount).toBe(2)

    await Team.deleteById(team.id)

    const membersNow = await TeamMember.find({
      teamId: team.id,
    })

    expect(membersNow.totalCount).toBe(0)
  })
})

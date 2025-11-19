import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { v4 as uuid } from 'uuid'

import { db, migrationManager } from '../../../db'
import subscriptionManager from '../../../graphql/pubsub'
import DbTestUtils from '../../../db/DbTestUtils'
import config from '../../../configManager/config'

import User from '../../user/user.model'
import Team from '../../team/team.model'
import TeamMember from '../teamMember.model'

describe('Team Member Model', () => {
  beforeAll(async () => {
    config.reset()
    await config.init({
      components: ['src/models/team', 'src/models/teamMember'],
      teams: {
        global: [
          {
            displayName: 'Editor',
            role: 'editor',
          },
        ],
        nonGlobal: [
          {
            displayName: 'Author',
            role: 'author',
          },
        ],
      },
    })

    await migrationManager.migrate()
  })

  beforeEach(async () => {
    await DbTestUtils.clearDb()
  })

  afterAll(async () => {
    config.reset()
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

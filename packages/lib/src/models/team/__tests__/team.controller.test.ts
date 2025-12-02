import { describe, beforeAll, beforeEach, afterAll, it, expect } from 'vitest'
import { v4 as uuid } from 'uuid'

import { db, migrationManager } from '../../../db'
import { TeamMember } from '../../index'
import config from '../../../configManager/config'

import {
  getTeam,
  getTeams,
  updateTeamMembership,
  addTeamMember,
  removeTeamMember,
} from '../team.controller'

import { createGlobalTeamWithUsers } from '../../__tests__/helpers/teams'

import { createUser } from '../../__tests__/helpers/users'

import DbTestUtils from '../../../db/DbTestUtils'

describe('Team Controller', () => {
  beforeAll(async () => {
    config.reset()
    await config.init({
      components: ['./src/models/team', './src/models/teamMember'],
      teams: {
        nonGlobal: [],
        global: [
          {
            displayName: 'Editor',
            role: 'editor',
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
  })

  it('fetches team for provided id', async () => {
    const { team } = await createGlobalTeamWithUsers()
    const fetchedTeam = await getTeam(team.id)

    expect(fetchedTeam).toBeDefined()
  })

  it('fetches team for provided id with members', async () => {
    const { team } = await createGlobalTeamWithUsers()
    const fetchedTeam = await getTeam(team.id, { related: 'members' })
    expect(fetchedTeam.members).toBeDefined()
  })

  it('throws when team id is not valid', async () => {
    await expect(getTeam(uuid())).rejects.toThrow(/NotFoundError/)
  })

  it('fetches all teams', async () => {
    await createGlobalTeamWithUsers()
    const fetchedTeams = await getTeams()
    const { result } = fetchedTeams
    expect(result[0]).toBeDefined()
  })

  it('fetches all teams based on params', async () => {
    await createGlobalTeamWithUsers()
    const fetchedTeams = await getTeams({ global: true })
    const { result } = fetchedTeams
    expect(result[0]).toBeDefined()
  })

  it('adds new member to team', async () => {
    const { team } = await createGlobalTeamWithUsers()
    const newUser = await createUser()
    await addTeamMember(team.id, newUser.id)

    const { result: teamMembers } = await TeamMember.find({
      teamId: team.id,
      userId: newUser.id,
    })

    expect(teamMembers[0].userId).toEqual(newUser.id)
  })

  it('throws when trying to add a non existent user', async () => {
    const { team } = await createGlobalTeamWithUsers()

    await expect(addTeamMember(team.id, uuid())).rejects.toThrow(
      /insert or update on table "team_members" violates foreign key constraint "team_members_user_id_foreign"/,
    )
  })

  it('remove member from team', async () => {
    const { team, user } = await createGlobalTeamWithUsers()
    await removeTeamMember(team.id, user.id)
    const { result: teamMembers } = await TeamMember.find({ teamId: team.id })
    expect(teamMembers).toHaveLength(0)
  })

  it('throws when trying to remove a user who is not member of the team', async () => {
    const { team } = await createGlobalTeamWithUsers()

    await expect(removeTeamMember(team.id, uuid())).rejects.toThrow(
      /NotFoundError/,
    )
  })

  it('updates members from team', async () => {
    const { team } = await createGlobalTeamWithUsers()
    const newUser = await createUser()
    await updateTeamMembership(team.id, [newUser.id])
    const { result: teamMembers } = await TeamMember.find({ teamId: team.id })
    expect(teamMembers).toHaveLength(1)
    expect(teamMembers[0].userId).toEqual(newUser.id)
  })
})

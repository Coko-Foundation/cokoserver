const { v4: uuid } = require('uuid')

const { db } = require('../../../db')
const { TeamMember } = require('../../index')

const {
  getTeam,
  getTeams,
  updateTeamMembership,
  addTeamMember,
  removeTeamMember,
} = require('../team.controller')

const { createGlobalTeamWithUsers } = require('../../__tests__/helpers/teams')

const { createUser } = require('../../__tests__/helpers/users')

const clearDb = require('../../_helpers/clearDb')

describe('Team Controller', () => {
  beforeEach(() => clearDb())

  afterAll(async () => {
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

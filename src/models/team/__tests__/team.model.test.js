const { v4: uuid } = require('uuid')
const { Team, TeamMember, User } = require('../../index')
const { createGlobalTeamWithUsers } = require('../../__tests__/helpers/teams')
const clearDb = require('../../_helpers/clearDb')

describe('Team Model', () => {
  beforeEach(() => clearDb())

  afterAll(() => {
    const knex = Team.knex()
    knex.destroy()
  })

  it('cannot create a global team with object type and object id', async () => {
    await expect(
      Team.insert({
        role: 'author',
        displayName: 'Author',
        objectId: uuid(),
        objectType: 'someType',
        global: true,
      }),
    ).rejects.toThrow(
      /global_teams_must_not_have_associated_objects_other_teams_must_/,
    )
  })

  it('throws when displayName does not correspond to role', async () => {
    await expect(
      Team.insert({
        role: 'author',
        displayName: 'Editor',
        objectId: uuid(),
        objectType: 'someType',
        global: true,
      }),
    ).rejects.toThrow()
  })

  it('ensures global teams are unique', async () => {
    await Team.insert({
      role: 'editor',
      displayName: 'Editor',
      global: true,
    })

    const createDuplicate = () =>
      Team.insert({
        role: 'editor',
        displayName: 'Editor',
        global: true,
      })

    await expect(createDuplicate()).rejects.toThrow()
  })

  it('ensures non-global teams are unique per object', async () => {
    const id = uuid()

    await Team.insert({
      role: 'author',
      displayName: 'Author',
      objectId: id,
      objectType: 'unknownObject',
    })

    const second = await Team.insert({
      role: 'author',
      displayName: 'Author',
      objectId: uuid(), // different object id
      objectType: 'unknownObject',
    })

    const createDuplicate = () =>
      Team.insert({
        role: 'author',
        displayName: 'Author',
        objectId: id, // same object id
        objectType: 'unknownObject',
      })

    expect(second).toBeDefined()
    await expect(createDuplicate()).rejects.toThrow()
  })

  it('ensures non-global teams must have an associated object', async () => {
    const create = () =>
      Team.insert({
        role: 'author',
        displayName: 'Author',
      })

    await expect(create()).rejects.toThrow()
  })

  it('ensures teams only accept valid roles', async () => {
    const createTeam = () =>
      Team.insert({
        role: 'lorem',
        displayName: 'Lorem',
      })

    await expect(createTeam()).rejects.toThrow()
  })

  it('ensures global teams should only accept global roles', async () => {
    const createValid = () =>
      Team.insert({
        role: 'editor',
        displayName: 'Editor',
        global: true,
      })

    const createInvalid = () =>
      Team.insert({
        role: 'reviewer',
        displayName: 'Reviewer',
        global: true,
      })

    const globalTeam = await createValid()
    expect(globalTeam.id).toBeDefined()
    await expect(createInvalid()).rejects.toThrow()
  })

  it('ensures non-global teams should only accept non-global roles', async () => {
    const createValid = () =>
      Team.insert({
        role: 'author',
        displayName: 'Author',
        objectId: uuid(),
        objectType: 'unknownObject',
      })

    const createInvalid = () =>
      Team.insert({
        role: 'admin',
        displayName: 'Admin',
        objectId: uuid(),
        objectType: 'unknownObject',
      })

    const validTeam = await createValid()
    expect(validTeam.id).toBeDefined()
    await expect(createInvalid()).rejects.toThrow()
  })

  it('finds all global teams', async () => {
    await Team.insert([
      {
        role: 'editor',
        displayName: 'Editor',
        global: true,
      },
      {
        role: 'author',
        displayName: 'Author',
        global: true,
      },
    ])

    const teams = await Team.findAllGlobalTeams()
    expect(teams.length).toEqual(2)

    const editorTeam = teams.find(t => t.role === 'editor')
    expect(editorTeam).toBeDefined()
    expect(editorTeam.global).toBeTruthy()

    const authorTeam = teams.find(t => t.role === 'author')
    expect(authorTeam).toBeDefined()
    expect(authorTeam.global).toBeTruthy()
  })

  it('finds global teams by role', async () => {
    await Team.insert({
      role: 'editor',
      displayName: 'Editor',
      global: true,
    })

    const res = await Team.findGlobalTeamByRole('editor')

    expect(res).toBeDefined()
    expect(res.role).toEqual('editor')
    expect(res.global).toBeTruthy()
  })

  it('finds teams by role and object', async () => {
    const objectId = uuid()
    const objectType = 'lorem'

    const EDITOR_ROLE = 'editor'

    await Team.insert({
      role: 'author',
      displayName: 'Author',
      objectId,
      objectType,
    })

    await Team.insert({
      role: EDITOR_ROLE,
      displayName: 'Editor',
      objectId,
      objectType,
    })

    const authorTeam = await Team.findTeamByRoleAndObject('author', objectId)

    expect(authorTeam).toBeDefined()
    expect(authorTeam.role).toEqual('author')
    expect(authorTeam.global).toBeFalsy()

    const editorTeam = await Team.findTeamByRoleAndObject(EDITOR_ROLE, objectId)

    expect(editorTeam).toBeDefined()
    expect(editorTeam.role).toEqual(EDITOR_ROLE)
    expect(editorTeam.global).toBeFalsy()
  })

  it('adds member to team', async () => {
    const team = await Team.insert({
      role: 'editor',
      displayName: 'Editor',
      global: true,
    })

    const user = await User.insert({})

    await Team.addMember(team.id, user.id)

    const member = await TeamMember.findOne({
      teamId: team.id,
      userId: user.id,
    })

    expect(member).toBeDefined()
  })

  it('removes a team member from a team', async () => {
    const { user, team } = await createGlobalTeamWithUsers()
    await Team.removeMember(team.id, user.id)

    const teamWithMembers = await Team.findById(team.id, { related: 'members' })

    expect(teamWithMembers.members).toHaveLength(0)
  })

  it('fetches team members', async () => {
    const { user, team } = await createGlobalTeamWithUsers()

    const teamWithMembers = await Team.findById(team.id, { related: 'members' })

    expect(teamWithMembers.members).toHaveLength(1)
    expect(teamWithMembers.members[0].userId).toEqual(user.id)
  })

  it('fetches team users', async () => {
    const { user, team } = await createGlobalTeamWithUsers()

    const teamWithUsers = await Team.findById(team.id, { related: 'users' })

    expect(teamWithUsers.users).toHaveLength(1)
    expect(teamWithUsers.users[0].id).toEqual(user.id)
  })

  it('updates team membership given an array of user ids', async () => {
    const userOne = await User.insert({})
    const userTwo = await User.insert({})
    const userThree = await User.insert({})

    const editorTeam = await Team.insert({
      role: 'editor',
      displayName: 'Editor',
      global: true,
    })

    const authorTeam = await Team.insert({
      role: 'author',
      displayName: 'Author',
      global: true,
    })

    await TeamMember.insert([
      {
        teamId: editorTeam.id,
        userId: userOne.id,
      },
      {
        teamId: authorTeam.id,
        userId: userTwo.id,
      },
    ])

    await Team.updateMembershipByTeamId(editorTeam.id, [
      userOne.id,
      userThree.id,
    ])

    await Team.updateMembershipByTeamId(authorTeam.id, [])

    const { result: editors } = await TeamMember.find({ teamId: editorTeam.id })

    const editorIds = editors.map(member => member.userId)
    expect(editorIds.length).toEqual(2)
    expect(editorIds.includes(userOne.id)).toBeTruthy()
    expect(editorIds.includes(userThree.id)).toBeTruthy()

    const { result: authors } = await TeamMember.find({ teamId: authorTeam.id })

    expect(authors.length).toEqual(0)
  })

  it('deletes memberships after team is deleted', async () => {
    const { team, user } = await createGlobalTeamWithUsers()

    let foundUser = await User.findById(user.id, { related: 'teams' })

    expect(foundUser.teams).toHaveLength(1)

    await Team.deleteById(team.id)

    foundUser = await User.findById(user.id, { related: 'teams' })

    expect(foundUser.teams).toHaveLength(0)
  })

  it('adds member to global team by role', async () => {
    const editorTeam = await Team.insert({
      role: 'editor',
      displayName: 'Editor',
      global: true,
    })

    const user = await User.insert({})

    let members = await TeamMember.find({
      teamId: editorTeam.id,
    })

    expect(members.result).toEqual([])

    await Team.addMemberToGlobalTeam(user.id, 'editor')

    members = await TeamMember.find({
      teamId: editorTeam.id,
    })

    expect(members.result.length).toEqual(1)
    expect(members.result[0].userId).toEqual(user.id)
  })

  it('removes member from global team by role', async () => {
    const editorTeam = await Team.insert({
      role: 'editor',
      displayName: 'Editor',
      global: true,
    })

    const user = await User.insert({})

    await Team.addMemberToGlobalTeam(user.id, 'editor')

    let members = await TeamMember.find({
      teamId: editorTeam.id,
    })

    expect(members.result.length).toEqual(1)
    expect(members.result[0].userId).toEqual(user.id)

    await Team.removeMemberFromGlobalTeam(user.id, 'editor')

    members = await TeamMember.find({
      teamId: editorTeam.id,
    })

    expect(members.result).toEqual([])
  })

  it('adds team member status on update membership', async () => {
    const team = await Team.insert({
      role: 'reviewer',
      displayName: 'Reviewer',
      global: false,
      objectId: uuid(),
      objectType: 'someObjectType',
    })

    const user1 = await User.insert({})
    const user2 = await User.insert({})

    await Team.updateMembershipByTeamId(team.id, [user1.id, user2.id])

    const { result: teamMembers1 } = await TeamMember.find({ teamId: team.id })

    teamMembers1.forEach(member => expect(member.status).toBe(null))

    const NOT_INVITED = 'notInvited'

    await Team.updateMembershipByTeamId(team.id, [])
    await Team.updateMembershipByTeamId(team.id, [user1.id, user2.id], {
      status: NOT_INVITED,
    })

    const { result: teamMembers2 } = await TeamMember.find({ teamId: team.id })

    teamMembers2.forEach(member => expect(member.status).toBe(NOT_INVITED))
  })
})

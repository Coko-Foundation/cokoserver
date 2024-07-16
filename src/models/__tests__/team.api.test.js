const gqlServer = require('../../utils/graphqlTestServer')
const { Team, TeamMember, User } = require('..')
const db = require('../../dbManager/db')
const clearDb = require('./_clearDb')

describe('Team API', () => {
  beforeEach(async () => {
    await clearDb()
  })

  afterAll(async () => {
    await db.destroy()
  })

  it('returns global teams with members', async () => {
    const globalTeam = await Team.insert({
      role: 'editor',
      displayName: 'Editor',
      global: true,
    })

    const user = await User.insert({})

    const member = await TeamMember.insert({
      teamId: globalTeam.id,
      userId: user.id,
    })

    const GET_GLOBAL_TEAMS = `
      query GetGlobalTeams {
        getGlobalTeams {
          result {
            id
            members {
              id
              user {
                id
              }
            }
          }
          totalCount
        }
      }
    `

    const result = await gqlServer.executeOperation({
      query: GET_GLOBAL_TEAMS,
    })

    const data = result.body.singleResult.data.getGlobalTeams

    expect(data.totalCount).toBe(1)
    expect(data.result).toHaveLength(1)
    const foundTeam = data.result[0]
    expect(foundTeam.id).toEqual(globalTeam.id)

    expect(foundTeam.members).toHaveLength(1)
    const foundMember = foundTeam.members[0]
    expect(foundMember.id).toEqual(member.id)

    const foundUser = foundMember.user
    expect(foundUser.id).toEqual(user.id)
  })

  it('returns only current user in members array when currentUserOnly flag is on', async () => {
    const globalTeam = await Team.insert({
      role: 'editor',
      displayName: 'Editor',
      global: true,
    })

    const anotherTeam = await Team.insert({
      role: 'author',
      displayName: 'Author',
      global: true,
    })

    const user = await User.insert({})
    const user2 = await User.insert({})

    const member = await TeamMember.insert({
      teamId: globalTeam.id,
      userId: user.id,
    })

    await TeamMember.insert({
      teamId: globalTeam.id,
      userId: user2.id,
    })

    // add user to two teams to make sure you get the correct member in the result
    await TeamMember.insert({
      teamId: anotherTeam.id,
      userId: user.id,
    })

    const GET_GLOBAL_TEAMS = `
      query GetGlobalTeams {
        getGlobalTeams {
          result {
            id
            role
            members(currentUserOnly:true) {
              id
              user {
                id
              }
            }
          }
          totalCount
        }
      }
    `

    const result = await gqlServer.executeOperation(
      {
        query: GET_GLOBAL_TEAMS,
      },
      {
        contextValue: {
          userId: user.id,
        },
      },
    )

    const foundTeam = result.body.singleResult.data.getGlobalTeams.result.find(
      t => t.role === 'editor',
    )

    expect(foundTeam.id).toEqual(globalTeam.id)

    expect(foundTeam.members).toHaveLength(1)
    const foundMember = foundTeam.members[0]
    expect(foundMember.id).toEqual(member.id)

    const foundUser = foundMember.user
    expect(foundUser.id).toEqual(user.id)
  })
})

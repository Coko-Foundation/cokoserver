const gql = require('graphql-tag')

const gqlServer = require('../../../utils/createGraphqlTestServer')()
const { Team, TeamMember, User } = require('../..')
const { db, migrationManager } = require('../../../db')
const subscriptionManager = require('../../../graphql/pubsub')
const clearDb = require('../../_helpers/clearDb')
const Fake = require('../../__tests__/helpers/fake/fake.model')

describe('Team API', () => {
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

  it('returns teams for an object', async () => {
    const fake = await Fake.insert({})
    const anotherFake = await Fake.insert({})
    const user = await User.insert({})

    const team = await Team.insert({
      role: 'author',
      displayName: 'Author',
      objectId: fake.id,
      objectType: 'fake',
    })

    await Team.insert({
      role: 'author',
      displayName: 'Author',
      objectId: anotherFake.id,
      objectType: 'fake',
    })

    await TeamMember.insert({
      teamId: team.id,
      userId: user.id,
    })

    const GET_OBJECT_TEAMS = gql`
      query GetObjectTeams($filter: TeamFilter) {
        teams(filter: $filter) {
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
      query: GET_OBJECT_TEAMS,
      variables: { filter: { objectId: fake.id } },
    })

    const data = result.body.singleResult.data.teams
    expect(data.totalCount).toBe(1)
    expect(data.result[0].id).toBe(team.id)
    expect(data.result[0].members).toHaveLength(1)
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

    const fake = await Fake.insert({})
    await Team.insert({
      role: 'editor',
      displayName: 'Editor',
      objectId: fake.id,
      objectType: 'fake',
    })

    const GET_GLOBAL_TEAMS = gql`
      query GetGlobalTeams($filter: TeamFilter) {
        teams(filter: $filter) {
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
      variables: { filter: { global: true } },
    })

    const data = result.body.singleResult.data.teams

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

    const GET_GLOBAL_TEAMS = gql`
      query GetGlobalTeams($filter: TeamFilter) {
        teams(filter: $filter) {
          result {
            id
            role
            members(currentUserOnly: true) {
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
        variables: { filter: { global: true } },
      },
      {
        contextValue: {
          userId: user.id,
        },
      },
    )

    const foundTeam = result.body.singleResult.data.teams.result.find(
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

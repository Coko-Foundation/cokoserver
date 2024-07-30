const { Team, TeamMember, User } = require('../../models')
const clearDb = require('../../models/__tests__/_clearDb')
const api = require('../helpers/api')
const authentication = require('../../authentication')
const { db } = require('../../db')

describe('GraphQL core queries', () => {
  let token
  let user

  const userData = {
    username: 'testuser',
    password: 'password',
  }

  beforeEach(async () => {
    await clearDb()
    user = await User.insert(userData)
    token = authentication.token.create(user)
  })

  afterAll(() => {
    db.destroy()
  })

  it('can resolve all users', async () => {
    const { body } = await api.graphql.query(
      `{ users { result { username } } }`,
      {},
      token,
    )

    expect(body).toEqual({
      data: {
        users: {
          result: [{ username: user.username }],
        },
      },
    })
  })

  it('can resolve user by ID', async () => {
    const { body } = await api.graphql.query(
      `query($id: ID) {
          user(id: $id) {
            username
          }
        }`,
      { id: user.id },
      token,
    )

    expect(body).toEqual({
      data: { user: { username: user.username } },
    })
  })

  it('can resolve a query for a missing object', async () => {
    const { body } = await api.graphql.query(
      `query($id: ID) {
          user(id: $id) {
            username
          }
        }`,
      { id: '09e2fdec-a589-4104-b366-108b6e54f2b8' },
      token,
    )

    expect(body.data).toEqual({ user: null })
    expect(body.errors[0].message).toMatch(
      'Something went wrong! Please contact your administrator',
    )
  })

  it('can resolve nested query', async () => {
    const team = await Team.insert({
      role: 'editor',
      displayName: 'Editor',
      users: [{ id: user.id }],
      global: true,
    })

    await TeamMember.insert({
      teamId: team.id,
      userId: user.id,
    })

    const { body } = await api.graphql.query(
      `{
        users {
          result {
            username, 
            teams { 
              displayName, 
              global 
            } 
          }
        } 
      }`,
      {},
      token,
    )

    expect(body).toEqual({
      data: {
        users: {
          result: [
            {
              username: user.username,
              teams: [
                {
                  displayName: 'Editor',
                  global: true,
                },
              ],
            },
          ],
        },
      },
    })
  })
})

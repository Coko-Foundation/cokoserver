const createTestServer = require('./helpers/createTestServer')
const { User, Identity } = require('..')

const clearDb = require('./_clearDb')

describe('Team API', () => {
  beforeEach(() => clearDb())

  afterAll(() => {
    const knex = User.knex()
    knex.destroy()
  })

  it('gets user identities', async () => {
    const user = await User.insert({})

    const identities = await Identity.insert([
      {
        userId: user.id,
        email: 'test1@example.com',
        isVerified: false,
      },
      {
        userId: user.id,
        email: 'test2@example.com',
        isVerified: false,
      },
    ])

    const GET_USER_IDENTITIES = `
      query GetUserIdentities {
        user (id: "${user.id}") {
          id
          identities {
            id
            email
            isVerified
          }
        }
      }
    `

    const testServer = await createTestServer()

    const response = await testServer.executeOperation({
      query: GET_USER_IDENTITIES,
    })

    const responseIdentities = response.data.user.identities

    expect(responseIdentities[0].id).toBe(identities[0].id)
    expect(responseIdentities[1].id).toBe(identities[1].id)

    // make sure server does not cache responses even if they've been changed
    expect(responseIdentities[0].isVerified).toBe(false)

    const verifiedIdentity = await Identity.patchAndFetchById(
      identities[0].id,
      { isVerified: true },
    )

    const newResponse = await testServer.executeOperation({
      query: GET_USER_IDENTITIES,
    })

    const newResponseIdentities = newResponse.data.user.identities

    const changedIdentity = newResponseIdentities.find(
      i => i.id === verifiedIdentity.id,
    )

    expect(changedIdentity.isVerified).toBe(true)
  })

  it('gets user default identity', async () => {
    const user = await User.insert({})

    const identities = await Identity.insert([
      {
        userId: user.id,
        email: 'test1@example.com',
        isDefault: true,
      },
      {
        userId: user.id,
        email: 'test2@example.com',
        isVerified: false,
      },
    ])

    const GET_USER_IDENTITIES = `
      query GetDefaultIdentity {
        user (id: "${user.id}") {
          id
          defaultIdentity {
            id
            email
            isVerified
          }
        }
      }
    `

    const testServer = await createTestServer()

    const response = await testServer.executeOperation({
      query: GET_USER_IDENTITIES,
    })

    const { defaultIdentity } = response.data.user

    expect(defaultIdentity.id).toBe(identities[0].id)
  })
})

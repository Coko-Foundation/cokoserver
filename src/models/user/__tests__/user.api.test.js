const gql = require('graphql-tag')

const { db, migrationManager } = require('../../../db')
const subscriptionManager = require('../../../graphql/pubsub')
const gqlServer = require('../../../utils/createGraphqlTestServer')()
const clearDb = require('../../_helpers/clearDb')

const User = require('../user.model')
const Identity = require('../../identity/identity.model')

describe('User API', () => {
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

    const GET_USER_IDENTITIES = gql`
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

    const response = await gqlServer.executeOperation({
      query: GET_USER_IDENTITIES,
    })

    const responseIdentities = response.body.singleResult.data.user.identities

    expect(responseIdentities[0].id).toBe(identities[0].id)
    expect(responseIdentities[1].id).toBe(identities[1].id)

    // make sure server does not cache responses even if they've been changed
    expect(responseIdentities[0].isVerified).toBe(false)

    const verifiedIdentity = await Identity.patchAndFetchById(
      identities[0].id,
      { isVerified: true },
    )

    const newResponse = await gqlServer.executeOperation({
      query: GET_USER_IDENTITIES,
    })

    const newResponseIdentities =
      newResponse.body.singleResult.data.user.identities

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

    const GET_USER_IDENTITIES = gql`
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

    const response = await gqlServer.executeOperation({
      query: GET_USER_IDENTITIES,
    })

    const { defaultIdentity } = response.body.singleResult.data.user

    expect(defaultIdentity.id).toBe(identities[0].id)
  })

  it('filters users', async () => {
    const userOne = await User.insert({
      isActive: true,
    })

    await User.insert({
      isActive: false,
    })

    const ACTIVE_USERS = gql`
      query ActiveUsers {
        users(filter: { isActive: true }) {
          result {
            id
            isActive
          }
          totalCount
        }
      }
    `

    const response = await gqlServer.executeOperation({
      query: ACTIVE_USERS,
    })

    const data = response.body.singleResult.data.users

    expect(data.totalCount).toBe(1)
    expect(data.result[0].id).toBe(userOne.id)
  })

  it('updates user info', async () => {
    const u = await User.insert({
      givenNames: 'Joe',
      surname: 'Brown',
    })

    expect(u.givenNames).toBe('Joe')
    expect(u.surname).toBe('Brown')

    const identity = await Identity.insert({
      userId: u.id,
      email: 'test@example.com',
      isDefault: true,
    })

    expect(identity.email).toBe('test@example.com')

    const UPDATE_USER_INFO = gql`
      mutation UpdateUserInfo($id: ID!, $input: UpdateUserInput!) {
        updateUser(id: $id, input: $input) {
          id
          givenNames
          surname
          defaultIdentity {
            id
            email
          }
        }
      }
    `

    const response = await gqlServer.executeOperation({
      query: UPDATE_USER_INFO,
      variables: {
        id: u.id,
        input: {
          givenNames: 'Jack',
          surname: 'Black',
          identityId: identity.id,
          email: 'jack@example.com',
        },
      },
    })

    const data = response.body.singleResult.data.updateUser

    expect(data.givenNames).toBe('Jack')
    expect(data.surname).toBe('Black')
    expect(data.defaultIdentity.email).toBe('jack@example.com')
  })
})

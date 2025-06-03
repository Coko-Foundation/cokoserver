const User = require('../user.model')
const Identity = require('../../identity/identity.model')

const { db } = require('../../../db')

const {
  createUser,
  createUserAndDefaultIdentity,
  createUserWithPasswordAndIdentities,
  createUserWithPasswordAndDefaultIdentity,
} = require('../../__tests__/helpers/users')

const {
  getDisplayName,
  getUser,
  getUsers,
  activateUser,
  activateUsers,
  login,
  signUp,
  deactivateUser,
  deactivateUsers,
  deleteUser,
  deleteUsers,
  resetPassword,
  sendPasswordResetEmail,
  setDefaultIdentity,
  updateUser,
  updatePassword,
} = require('../user.controller')

const clearDb = require('../../_helpers/clearDb')

jest.mock('../../../services/notify.js')
jest.mock('../../_helpers/emailTemplates.js')

describe('User Controller', () => {
  beforeEach(async () => {
    await clearDb()
  })

  afterAll(async () => {
    await db.destroy()
  })

  it('fetches a specific user', async () => {
    const user = await createUser()
    const fetchedUser = await getUser(user.id)
    expect(fetchedUser).toBeDefined()
  })

  it('fetches all the available users', async () => {
    const user1 = await createUser()
    const user2 = await createUser()
    const { result: fetchedUsers } = await getUsers()
    expect(fetchedUsers).toHaveLength(2)
    expect(fetchedUsers[0].id).toEqual(user1.id)
    expect(fetchedUsers[1].id).toEqual(user2.id)
  })

  it('returns the display name of user', async () => {
    const user = await createUser()
    const fullName = await getDisplayName(user)
    expect(fullName).toEqual(`${user.givenNames} ${user.surname}`)
  })

  it('can activate an existing user', async () => {
    const user = await createUser()
    await activateUser(user.id)
    const fetchedUser = await getUser(user.id)
    expect(fetchedUser.isActive).toEqual(true)
  })

  it('can activate multiple users', async () => {
    const user1 = await createUser()
    const user2 = await createUser()
    await activateUsers([user1.id, user2.id])
    const { result: fetchedUsers } = await getUsers()
    expect(fetchedUsers[0].isActive).toEqual(true)
    expect(fetchedUsers[1].isActive).toEqual(true)
  })

  it('can deactivate an existing user', async () => {
    const user = await createUser()
    await activateUser(user.id)
    await deactivateUser(user.id)
    const fetchedUser = await getUser(user.id)
    expect(fetchedUser.isActive).toEqual(false)
  })

  it('can deactivate multiple users', async () => {
    const user1 = await createUser()
    const user2 = await createUser()
    await activateUsers([user1.id, user2.id])
    await deactivateUsers([user1.id, user2.id])
    const { result: fetchedUsers } = await getUsers()
    expect(fetchedUsers[0].isActive).toEqual(false)
    expect(fetchedUsers[1].isActive).toEqual(false)
  })

  it('can delete an existing user', async () => {
    const { user } = await createUserAndDefaultIdentity()
    await deleteUser(user.id)

    const users = await User.find({})
    expect(users.totalCount).toBe(0)
    const identities = await Identity.find({})
    expect(identities.totalCount).toBe(0)
  })

  it('can delete multiple users', async () => {
    const { user: user1 } = await createUserAndDefaultIdentity()
    const { user: user2 } = await createUserAndDefaultIdentity()

    await deleteUsers([user1.id, user2.id])

    const users = await User.find({})
    expect(users.totalCount).toBe(0)
    const identities = await Identity.find({})
    expect(identities.totalCount).toBe(0)
  })

  it('can update user current password', async () => {
    const { user } = await createUserWithPasswordAndDefaultIdentity('password1')
    await updatePassword(user.id, 'password1', 'password2')
    const fetchedUser = await getUser(user.id)
    const isPasswordChanged = await fetchedUser.isPasswordValid('password2')
    expect(isPasswordChanged).toEqual(true)
  })

  it('can allow user to login with email and password', async () => {
    const { id } = await createUserWithPasswordAndIdentities('password1')

    const res = await login({
      email: id.email,
      password: 'password1',
    })

    expect(res.token).toBeDefined()
  })

  it('can allow user to login with username and password', async () => {
    const { user } = await createUserWithPasswordAndIdentities('password1')

    const res = await login({
      username: user.username,
      password: 'password1',
    })

    expect(res.token).toBeDefined()
  })

  it('can set a default identity to a user', async () => {
    const { user, id: identity } = await createUserWithPasswordAndIdentities(
      'password1',
    )

    await setDefaultIdentity(user.id, identity.id)
    const fetchedUser = await getUser(user.id, { related: 'defaultIdentity' })
    expect(fetchedUser.defaultIdentity.id).toEqual(identity.id)
  })

  it('can update user info', async () => {
    const { user } = await createUserWithPasswordAndIdentities('password1')

    await updateUser(user.id, { givenNames: 'Newgiven', surname: 'NewSurname' })
    const fetchedUser = await getUser(user.id)
    expect(fetchedUser.givenNames).toEqual('Newgiven')
    expect(fetchedUser.surname).toEqual('NewSurname')
  })

  it('can sign up a new user', async () => {
    const user = await signUp({
      username: 'aUserName',
      givenNames: 'Some Givenname',
      surname: 'A Surname',
      email: 'user@exmple.com',
      password: 'terriblePassword',
    })

    const fetchedUser = await User.findOne({ username: 'aUserName' })
    expect(fetchedUser.id).toEqual(user)
  })

  it('can reset a user password', async () => {
    const { user, id } = await createUserWithPasswordAndDefaultIdentity()
    await sendPasswordResetEmail(id.email)
    const fetchedUser = await getUser(user.id)
    expect(fetchedUser.passwordResetToken).toBeDefined()
    await resetPassword(fetchedUser.passwordResetToken, 'newPassword2')
    const updatedUser = await getUser(user.id)
    const isNewPassValid = await updatedUser.isPasswordValid('newPassword2')
    expect(isNewPassValid).toEqual(true)
  })
})

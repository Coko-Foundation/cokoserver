const clone = require('lodash/clone')

const { db, migrationManager } = require('../../../db')
const subscriptionManager = require('../../../graphql/pubsub')

const {
  createUserAndDefaultIdentity,
  createUserAndIdentities,
} = require('../../__tests__/helpers/users')

const {
  createGlobalTeamWithUsers,
  createLocalTeamWithUsers,
} = require('../../__tests__/helpers/teams')

const clearDb = require('../../_helpers/clearDb')

const {
  user,
  otherUser,
  userWithInvalidPassword,
  userWithFullName,
  userWithoutName,
} = require('../../__tests__/fixtures/users')

const User = require('../user.model')
const Identity = require('../../identity/identity.model')
const Team = require('../../team/team.model')
const TeamMember = require('../../teamMember/teamMember.model')

describe('User model', () => {
  beforeAll(async () => {
    await migrationManager.migrate()
  })

  beforeEach(() => clearDb())

  afterAll(async () => {
    await db.destroy()
    await subscriptionManager.client.end()
  })

  it('validates password correctly after saving to db', async () => {
    const newUser = await User.insert(user)

    const shouldBeValid = await newUser.isPasswordValid(user.password)

    expect(shouldBeValid).toEqual(true)
  })

  it('returns false when provided password is wrong', async () => {
    const newUser = await User.insert(user)

    const checkValidity = await newUser.isPasswordValid('wrong password')

    expect(checkValidity).toEqual(false)
  })

  it('throws error if trying to save a user with a non-unique username', async () => {
    await User.insert(user)
    const otherUserFixture = clone(otherUser)
    otherUserFixture.username = user.username

    const insertOtherUser = () =>
      User.insert({
        ...otherUserFixture,
      })

    await expect(insertOtherUser()).rejects.toThrow()
  })

  it('throws error if trying to save a user with a non-unique email', async () => {
    await User.insert(user)
    const otherUserFixture = clone(otherUser)
    otherUserFixture.email = user.email

    const insertOtherUser = () =>
      User.insert({
        ...otherUserFixture,
      })

    await expect(insertOtherUser()).rejects.toThrow()
  })

  it('should not contain field passwordHash', async () => {
    const newUser = await User.insert(user)
    const savedUser = await User.findById(newUser.id)
    const stringifiedUser = JSON.parse(JSON.stringify(savedUser))
    expect(stringifiedUser).not.toHaveProperty('passwordHash')
  })

  it('updates password', async () => {
    const newUser = await User.insert(user)
    await User.updatePassword(newUser.id, user.password, 'newPassword')
    const fetchedUser = await User.findById(newUser.id)
    const isValid = await fetchedUser.isPasswordValid('newPassword')
    expect(isValid).toEqual(true)
  })

  it('hashPassword (static) provides an alphanumeric string', async () => {
    const hash = await User.hashPassword('somepassword')
    expect(hash.length).toBeGreaterThan(0)
    expect(hash).not.toEqual('somepassword')
  })

  it('patches entity (using base model patch)', async () => {
    const newUser = await User.insert(user)
    await newUser.patch({ surname: 'Nicolson' })
    const fetchedUser = await User.findById(newUser.id)
    expect(fetchedUser.surname).toEqual('Nicolson')
  })

  it('patchAndFetchById entity (using base model patchAndFetchById)', async () => {
    const newUser = await User.insert(user)
    await User.patchAndFetchById(newUser.id, { surname: 'Nicolson' })
    const fetchedUser = await User.findById(newUser.id)
    expect(fetchedUser.surname).toEqual('Nicolson')
  })

  it('updates entity (using base model update)', async () => {
    const newUser = await User.insert(user)
    await newUser.update({ surname: 'Nicolson' })
    const fetchedUser = await User.findById(newUser.id)
    expect(fetchedUser.surname).toEqual('Nicolson')
  })

  it('updateAndFetchById entity (using base model updateAndFetchById)', async () => {
    const newUser = await User.insert(user)
    await User.updateAndFetchById(newUser.id, { surname: 'Nicolson' })
    const fetchedUser = await User.findById(newUser.id)
    expect(fetchedUser.surname).toEqual('Nicolson')
  })

  it('throws if password is invalid when inserting a new user', async () => {
    await expect(User.insert(userWithInvalidPassword)).rejects.toThrow()
  })

  it('throws when patch data contains password', async () => {
    const newUser = await User.insert(user)
    await expect(newUser.patch({ password: 'fishyPassword' })).rejects.toThrow()
  })

  it('throws when patch data contains passwordHash', async () => {
    const newUser = await User.insert(user)
    await expect(
      newUser.patch({ passwordHash: 'hashedFishyPassword' }),
    ).rejects.toThrow()
  })

  it('throws when patchAndFetchById data contains password', async () => {
    const newUser = await User.insert(user)
    await expect(
      User.patchAndFetchById(newUser.id, { password: 'fishyPassword' }),
    ).rejects.toThrow()
  })

  it('throws when patchAndFetchById data contains passwordHash', async () => {
    const newUser = await User.insert(user)
    await expect(
      User.patchAndFetchById(newUser.id, {
        passwordHash: 'hashedFishyPassword',
      }),
    ).rejects.toThrow()
  })

  it('throws when update data contains password', async () => {
    const newUser = await User.insert(user)
    await expect(
      newUser.update({ password: 'fishyPassword' }),
    ).rejects.toThrow()
  })

  it('throws when update data contains passwordHash', async () => {
    const newUser = await User.insert(user)
    await expect(
      newUser.update({ passwordHash: 'hashedFishyPassword' }),
    ).rejects.toThrow()
  })

  it('throws when updateAndFetchById data contains password', async () => {
    const newUser = await User.insert(user)
    await expect(
      User.updateAndFetchById(newUser.id, { password: 'fishyPassword' }),
    ).rejects.toThrow()
  })

  it('throws when updateAndFetchById data contains passwordHash', async () => {
    const newUser = await User.insert(user)
    await expect(
      User.updateAndFetchById(newUser.id, {
        passwordHash: 'hashedFishyPassword',
      }),
    ).rejects.toThrow()
  })

  it('returns username as display name when givenNames and surname are not defined', async () => {
    const newUser = await User.insert(user)
    const displayName = await newUser.getDisplayName()
    expect(displayName).toEqual(user.username)
  })

  it('returns full name as display name when given names and surname are defined', async () => {
    const newUser = await User.insert(userWithFullName)
    const displayName = await newUser.getDisplayName()
    expect(displayName).toEqual(`${newUser.givenNames} ${newUser.surname}`)
  })

  it('getDisplayName throws an error when neither username nor givenNames nor surname are defined', async () => {
    const newUser = await User.insert(userWithoutName)

    await expect(newUser.getDisplayName()).rejects.toThrow()
  })

  it('throws when user tries to update their password by providing a wrong current password', async () => {
    const newUser = await User.insert(user)

    await expect(
      User.updatePassword(newUser.id, 'wrong old password', 'new password'),
    ).rejects.toThrow()
  })

  it('throws when user tries to update their password by providing the same password as the current one', async () => {
    const newUser = await User.insert(user)

    await expect(
      User.updatePassword(newUser.id, user.password, user.password),
    ).rejects.toThrow()
  })

  it('throws error when user tries to update hers/his password but this user does not exist', async () => {
    await expect(
      User.updatePassword('randomId', 'some old password', 'some new password'),
    ).rejects.toThrow()
  })

  it('fetches user identities', async () => {
    const {
      user: newUser,
      id: identity1,
      id2: identity2,
    } = await createUserAndIdentities()

    const dbUser = await User.findById(newUser.id, { related: 'identities' })

    const found1 = dbUser.identities.find(i => i.id === identity1.id)
    const found2 = dbUser.identities.find(i => i.id === identity2.id)

    expect(dbUser.identities).toHaveLength(2)
    expect(found1).not.toBe(undefined)
    expect(found2).not.toBe(undefined)
  })

  it('fetches user default identity', async () => {
    const { user: newUser, id: identity } = await createUserAndDefaultIdentity()

    const dbUser = await User.findById(newUser.id, {
      related: 'defaultIdentity',
    })

    expect(dbUser.defaultIdentity.id).toEqual(identity.id)
    expect(dbUser.defaultIdentity.isDefault).toEqual(true)
  })

  it('fetches user teams', async () => {
    const { user: newUser, team } = await createGlobalTeamWithUsers()

    const dbUser = await User.findById(newUser.id, { related: 'teams' })

    expect(dbUser.teams).toHaveLength(1)
    expect(dbUser.teams[0].id).toEqual(team.id)
  })

  it('checks if a user is member of a global team (static)', async () => {
    const { user: newUser, team } = await createGlobalTeamWithUsers()
    const hasGlobalRole = await User.hasGlobalRole(newUser.id, team.role)
    expect(hasGlobalRole).toBe(true)
  })

  it('checks if a user is member of a global team', async () => {
    const { user: newUser, team } = await createGlobalTeamWithUsers()
    const hasGlobalRole = await newUser.hasGlobalRole(team.role)
    expect(hasGlobalRole).toBe(true)
  })

  it('throws when hasGlobalRole method does not have required params', async () => {
    const { team } = await createGlobalTeamWithUsers()
    await expect(User.hasGlobalRole(undefined, team.role)).rejects.toThrow()
  })

  it('checks if a user has permission to act on an object (static)', async () => {
    const { user: newUser, team } = await createLocalTeamWithUsers()

    const canAct = await User.hasRoleOnObject(
      newUser.id,
      team.role,
      team.objectId,
    )

    expect(canAct).toEqual(true)
  })

  it('checks if a user has permission to act on an object', async () => {
    const { user: newUser, team } = await createLocalTeamWithUsers()

    const canAct = await newUser.hasRoleOnObject(team.role, team.objectId)

    expect(canAct).toEqual(true)
  })

  it('throws when hasRoleOnObject method does not have required params', async () => {
    const { team } = await createGlobalTeamWithUsers()
    await expect(
      User.hasRoleOnObject(undefined, team.role, team.objectId),
    ).rejects.toThrow()
  })

  it("gets user's teams", async () => {
    const myUser = await User.insert({})

    const team = await Team.insert({
      global: true,
      role: 'editor',
      displayName: 'Editor',
    })

    await Team.addMember(team.id, myUser.id)

    const userTeams = await User.getTeams(myUser.id)

    expect(userTeams.length).toBe(1)
    expect(userTeams[0].id).toEqual(team.id)

    const instanceTeams = await myUser.getTeams()
    expect(instanceTeams.length).toBe(1)
    expect(instanceTeams[0].id).toEqual(team.id)
  })

  it('deletes user identities and team memberships along with the user', async () => {
    const usr = await User.insert({})

    await Identity.insert({
      userId: usr.id,
      email: 'user@example.com',
    })

    await Identity.insert({
      userId: usr.id,
      email: 'user@fake.com',
    })

    const team = await Team.insert({
      global: true,
      role: 'editor',
      displayName: 'Editor',
    })

    const anotherTeam = await Team.insert({
      global: true,
      role: 'admin',
      displayName: 'Admin',
    })

    await Team.addMember(team.id, usr.id)
    await Team.addMember(anotherTeam.id, usr.id)

    let members = await TeamMember.find({})
    expect(members.totalCount).toBe(2)

    let identities = await Identity.find({})
    expect(identities.totalCount).toBe(2)

    await User.deleteById(usr.id)

    members = await TeamMember.find({})
    expect(members.totalCount).toBe(0)

    identities = await Identity.find({})
    expect(identities.totalCount).toBe(0)
  })
})

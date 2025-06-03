const { faker } = require('@faker-js/faker')

const Identity = require('../identity.model')
const { db } = require('../../../db')
const { createUser } = require('../../__tests__/helpers/users')

const {
  identityWithProfileData,
} = require('../../__tests__/fixtures/identities')

const clearDb = require('../../_helpers/clearDb')

describe('Identity model', () => {
  beforeEach(async () => {
    await clearDb()
  })

  afterAll(async () => {
    await db.destroy()
  })

  it('creates multiple identities for the same user', async () => {
    const user = await createUser()

    await Identity.insert({
      userId: user.id,
      email: faker.internet.email(),
      isVerified: false,
    })

    await Identity.insert({
      userId: user.id,
      email: faker.internet.email(),
      isVerified: false,
    })

    const { result: identities } = await Identity.find({ userId: user.id })
    expect(identities.length).toEqual(2)
  })

  it('cannot create identity without an email', async () => {
    const user = await createUser()

    await expect(
      Identity.insert({
        userId: user.id,
      }),
    ).rejects.toThrow()
  })

  it('cannot create identity without a userId', async () => {
    await expect(
      Identity.insert({
        email: faker.internet.email(),
      }),
    ).rejects.toThrow()
  })

  it('cannot have multiple default identities for the same user', async () => {
    const user = await createUser()

    await Identity.insert({
      userId: user.id,
      email: faker.internet.email(),
      isDefault: true,
    })

    await expect(
      Identity.insert({
        userId: user.id,
        email: faker.internet.email(),
        isDefault: true,
      }),
    ).rejects.toThrow()
  })

  it('fetches user info of an identity', async () => {
    const user = await createUser()

    const identity = await Identity.insert({
      userId: user.id,
      email: faker.internet.email(),
      isDefault: true,
    })

    const identityUser = await Identity.findById(identity.id, {
      related: 'user',
    })

    expect(identityUser.user.surname).toEqual(user.surname)
  })

  it('creates a user identity with profile data', async () => {
    const user = await createUser()

    const identity = await Identity.insert({
      userId: user.id,
      ...identityWithProfileData,
    })

    const identityUser = await Identity.findById(identity.id)

    expect(identityUser.profileData.displayName).toEqual(
      identityWithProfileData.profileData.displayName,
    )
  })

  it('creates two identities with the same email but different provider', async () => {
    const user = await createUser()

    const createIdentity = async provider => {
      return Identity.insert({
        userId: user.id,
        email: 'john@example.com',
        provider,
      })
    }

    // first time should be fine
    const id1 = await createIdentity('test1')
    const id2 = await createIdentity('test2')

    expect(id1.email).toEqual(id2.email)
    expect(id1.provider).not.toEqual(id2.provider)
  })

  it('fails when creating two identities with the same email and provider', async () => {
    const user = await createUser()

    const createIdentity = async () => {
      await Identity.insert({
        userId: user.id,
        email: 'john@example.com',
        provider: 'test',
      })
    }

    // first time should be fine
    await createIdentity()

    // second time should throw an error
    await expect(createIdentity).rejects.toThrow(/unique_provider_email/)
  })

  it('forces lowercase on emails', async () => {
    const user = await createUser()
    const sampleEmail = 'jOhN@EXAMple.coM'

    const identityData = {
      ...identityWithProfileData,
      email: sampleEmail,
    }

    const identity = await Identity.insert({
      userId: user.id,
      ...identityData,
    })

    const result = await Identity.findById(identity.id)

    expect(result.email).toEqual(sampleEmail.toLowerCase())
  })

  it('finds identities using email irrespective of case', async () => {
    const user = await createUser()
    const sampleEmail = 'jOhN@EXAMple.coM'

    const identityData = {
      ...identityWithProfileData,
      email: sampleEmail,
    }

    await Identity.insert({
      userId: user.id,
      ...identityData,
    })

    const identities = await Identity.find({ email: sampleEmail })
    expect(identities.result).toHaveLength(1)
    expect(identities.result[0].email).toEqual(sampleEmail.toLowerCase())
  })

  it('finds one identity using email irrespective of case', async () => {
    const user = await createUser()
    const sampleEmail = 'jOhN@EXAMple.coM'

    const identityData = {
      ...identityWithProfileData,
      email: sampleEmail,
    }

    await Identity.insert({
      userId: user.id,
      ...identityData,
    })

    const result = await Identity.findOne({ email: sampleEmail })
    expect(result).not.toBe(undefined)
    expect(result.email).toEqual(sampleEmail.toLowerCase())
  })
})

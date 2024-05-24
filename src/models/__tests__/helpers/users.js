// eslint-disable-next-line import/no-extraneous-dependencies
const { faker } = require('@faker-js/faker')

const { User, Identity } = require('../../index')

const createUser = async => {
  try {
    return User.insert({
      givenNames: faker.person.firstName(),
      surname: faker.person.lastName(),
    })
  } catch (e) {
    throw new Error(e)
  }
}

const createUserAndDefaultIdentity = async () => {
  const user = await User.query().insert({
    givenNames: faker.person.firstName(),
    surname: faker.person.lastName(),
  })

  const id = await Identity.query().insert({
    userId: user.id,
    email: faker.internet.email(),
    isVerified: true,
    isDefault: true,
  })

  return { user, id }
}

const createUserAndIdentities = async () => {
  const user = await User.query().insert({
    givenNames: faker.person.firstName(),
    surname: faker.person.lastName(),
  })

  const id = await Identity.query().insert({
    userId: user.id,
    email: faker.internet.email(),
    isVerified: true,
    isDefault: true,
  })

  const id2 = await Identity.query().insert({
    userId: user.id,
    email: faker.internet.email(),
    provider: 'test',
    isVerified: true,
    isDefault: false,
  })

  return { user, id, id2 }
}

const createUserWithPasswordAndIdentities = async password => {
  const user = await User.query().insert({
    givenNames: faker.person.firstName(),
    surname: faker.person.lastName(),
    password,
    username: faker.internet.userName(),
  })

  const id = await Identity.query().insert({
    userId: user.id,
    email: faker.internet.email().toLowerCase(),
    isVerified: true,
    isDefault: false,
  })

  const id2 = await Identity.query().insert({
    userId: user.id,
    email: faker.internet.email().toLowerCase(),
    isVerified: true,
    isDefault: false,
  })

  return { user, id, id2 }
}

const createUserWithPasswordAndDefaultIdentity = async password => {
  const user = await User.query().insert({
    givenNames: faker.person.firstName(),
    surname: faker.person.lastName(),
    password,
    username: faker.internet.userName(),
  })

  const id = await Identity.query().insert({
    userId: user.id,
    email: faker.internet.email().toLowerCase(),
    isVerified: true,
    isDefault: true,
  })

  return { user, id }
}

module.exports = {
  createUser,
  createUserAndIdentities,
  createUserAndDefaultIdentity,
  createUserWithPasswordAndIdentities,
  createUserWithPasswordAndDefaultIdentity,
}

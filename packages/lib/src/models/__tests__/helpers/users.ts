import { faker } from '@faker-js/faker'

import User from '../../user/user.model'
import Identity from '../../identity/identity.model'

const createUser = async (): Promise<User> => {
  return User.insert({
    givenNames: faker.person.firstName(),
    surname: faker.person.lastName(),
  })
}

const createUserAndDefaultIdentity = async (): Promise<{
  user: User
  id: Identity
}> => {
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

const createUserAndIdentities = async (): Promise<{
  user: User
  id: Identity
  id2: Identity
}> => {
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

const createUserWithPasswordAndIdentities = async (
  password: string,
): Promise<{
  user: User
  id: Identity
  id2: Identity
}> => {
  const user = await User.query().insert({
    givenNames: faker.person.firstName(),
    surname: faker.person.lastName(),
    password,
    username: faker.internet.username(),
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

const createUserWithPasswordAndDefaultIdentity = async (
  password: string = 'password',
): Promise<{ user: User; id: Identity }> => {
  const user = await User.query().insert({
    givenNames: faker.person.firstName(),
    surname: faker.person.lastName(),
    password,
    username: faker.internet.username(),
  })

  const id = await Identity.query().insert({
    userId: user.id,
    email: faker.internet.email().toLowerCase(),
    isVerified: true,
    isDefault: true,
  })

  return { user, id }
}

export {
  createUser,
  createUserAndIdentities,
  createUserAndDefaultIdentity,
  createUserWithPasswordAndIdentities,
  createUserWithPasswordAndDefaultIdentity,
}

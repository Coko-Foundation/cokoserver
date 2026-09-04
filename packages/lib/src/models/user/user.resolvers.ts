import { withFilter } from 'graphql-subscriptions'

import logger from '../../logger'
import subscriptionManager from '../../graphql/pubsub'

import { labels, subscriptions } from './constants'
import User from './user.model'
import Identity from '../identity/identity.model'
import Team from '../team/team.model'
import { QueryResult } from '../base.model'

import {
  getUser,
  getUsers,
  activateUser,
  activateUsers,
  deleteUser,
  deleteUsers,
  deactivateUser,
  deactivateUsers,
  updateUser,
  login,
  signUp,
  setDefaultIdentity,
  verifyEmail,
  resendVerificationEmail,
  resendVerificationEmailAfterLogin,
  updatePassword,
  sendPasswordResetEmail,
  resetPassword,
  getDisplayName,
  getUserTeams,
  LoginResponse,
} from './user.controller'

import {
  getUserIdentities,
  getDefaultIdentity,
} from '../identity/identity.controller'

const { USER_RESOLVER } = labels
const { USER_UPDATED } = subscriptions

const userResolver = async (_, { id }): Promise<User> => {
  try {
    logger.info(`${USER_RESOLVER} user`)
    return getUser(id)
  } catch (e) {
    logger.error(`${USER_RESOLVER} user: ${e.message}`)
    throw e
  }
}

const usersResolver = async (
  _,
  { filter, pagination },
): Promise<QueryResult<User>> => {
  try {
    logger.info(`${USER_RESOLVER} users`)
    return getUsers(filter, pagination)
  } catch (e) {
    logger.error(`${USER_RESOLVER} users: ${e.message}`)
    throw e
  }
}

const currentUserResolver = async (_, __, ctx): Promise<User> => {
  try {
    logger.info(`${USER_RESOLVER} currentUser`)
    if (!ctx.userId) return null
    return getUser(ctx.userId)
  } catch (e) {
    logger.error(`${USER_RESOLVER} currentUser: ${e.message}`)
    throw e
  }
}

const activateUserResolver = async (_, { id }): Promise<User> => {
  try {
    logger.info(`${USER_RESOLVER} activateUser`)
    return activateUser(id)
  } catch (e) {
    logger.error(`${USER_RESOLVER} activateUser: ${e.message}`)
    throw e
  }
}

const activateUsersResolver = async (_, { ids }): Promise<User[]> => {
  try {
    logger.info(`${USER_RESOLVER} activateUsers`)
    return activateUsers(ids)
  } catch (e) {
    logger.error(`${USER_RESOLVER} activateUsers: ${e.message}`)
    throw e
  }
}

const deleteUserResolver = async (_, { id }): Promise<number> => {
  try {
    logger.info(`${USER_RESOLVER} deleteUser`)
    return deleteUser(id)
  } catch (e) {
    logger.error(`${USER_RESOLVER} deleteUser: ${e.message}`)
    throw e
  }
}

const deleteUsersResolver = async (_, { ids }): Promise<number> => {
  try {
    logger.info(`${USER_RESOLVER} deleteUsers`)
    return deleteUsers(ids)
  } catch (e) {
    logger.error(`${USER_RESOLVER} deleteUsers: ${e.message}`)
    throw e
  }
}

const deactivateUserResolver = async (_, { id }): Promise<User> => {
  try {
    logger.info(`${USER_RESOLVER} deactivateUser`)
    return deactivateUser(id)
  } catch (e) {
    logger.error(`${USER_RESOLVER} deactivateUser: ${e.message}`)
    throw e
  }
}

const deactivateUsersResolver = async (_, { ids }): Promise<User[]> => {
  try {
    logger.info(`${USER_RESOLVER} deactivateUsers`)
    return deactivateUsers(ids)
  } catch (e) {
    logger.error(`${USER_RESOLVER} deactivateUsers: ${e.message}`)
    throw e
  }
}

const updateUserResolver = async (_, { id, input }): Promise<User> => {
  try {
    logger.info(`${USER_RESOLVER} updateUser`)

    const updatedUser = await updateUser(id, input)

    subscriptionManager.publish(USER_UPDATED, {
      userUpdated: updatedUser,
    })

    return updatedUser
  } catch (e) {
    logger.error(`${USER_RESOLVER} updateUser: ${e.message}`)
    throw e
  }
}

const loginResolver = async (_, { input }): Promise<LoginResponse> => {
  try {
    logger.info(`${USER_RESOLVER} login`)
    return login(input)
  } catch (e) {
    logger.error(`${USER_RESOLVER} login: ${e.message}`)
    throw e
  }
}

const signUpResolver = async (_, { input }): Promise<string> => {
  try {
    logger.info(`${USER_RESOLVER} signUp`)
    return signUp(input)
  } catch (e) {
    logger.error(`${USER_RESOLVER} signUp: ${e.message}`)
    throw e
  }
}

const setDefaultIdentityResolver = async (
  _,
  { userId, identityId },
): Promise<User> => {
  try {
    logger.info(`${USER_RESOLVER} setDefaultIdentity`)
    return setDefaultIdentity(userId, identityId)
  } catch (e) {
    logger.error(`${USER_RESOLVER} setDefaultIdentity: ${e.message}`)
    throw e
  }
}

const verifyEmailResolver = async (_, { token }): Promise<boolean> => {
  try {
    logger.info(`${USER_RESOLVER} verifyEmail`)
    return verifyEmail(token)
  } catch (e) {
    logger.error(`${USER_RESOLVER} verifyEmail: ${e.message}`)
    throw e
  }
}

const resendVerificationEmailResolver = async (
  _,
  { token },
): Promise<boolean> => {
  try {
    logger.info(`${USER_RESOLVER} resendVerificationEmail`)
    return resendVerificationEmail(token)
  } catch (e) {
    logger.error(`${USER_RESOLVER} resendVerificationEmail: ${e.message}`)
    throw e
  }
}

const resendVerificationEmailAfterLoginResolver = async (
  _,
  __,
  ctx,
): Promise<boolean> => {
  try {
    logger.info(`${USER_RESOLVER} resendVerificationEmailAfterLogin`)
    return resendVerificationEmailAfterLogin(ctx.userId)
  } catch (e) {
    logger.error(
      `${USER_RESOLVER} resendVerificationEmailAfterLogin: ${e.message}`,
    )
    throw e
  }
}

const updatePasswordResolver = async (_, { input }): Promise<boolean> => {
  try {
    logger.info(`${USER_RESOLVER} updatePassword`)
    const { id, currentPassword, newPassword } = input
    return updatePassword(id, currentPassword, newPassword)
  } catch (e) {
    logger.error(`${USER_RESOLVER} updatePassword: ${e.message}`)
    throw e
  }
}

const sendPasswordResetEmailResolver = async (
  _,
  { email },
): Promise<boolean> => {
  try {
    logger.info(`${USER_RESOLVER} sendPasswordResetEmail`)
    return sendPasswordResetEmail(email)
  } catch (e) {
    logger.error(`${USER_RESOLVER} sendPasswordResetEmail: ${e.message}`)
    throw e
  }
}

const resetPasswordResolver = async (
  _,
  { token, password },
): Promise<boolean> => {
  try {
    logger.info(`${USER_RESOLVER} resetPassword`)
    return resetPassword(token, password)
  } catch (e) {
    logger.error(`${USER_RESOLVER} resetPassword: ${e.message}`)
    throw e
  }
}

const identitiesResolver = async (user, _): Promise<Identity[]> => {
  const identities = await getUserIdentities(user.id)
  return identities.result
  // return ctx.loaders.Identity.identitiesBasedOnUserIdsLoader.load(user.id)
}

const defaultIdentityResolver = async (user): Promise<Identity> => {
  return getDefaultIdentity(user.id)
  // return ctx.loaders.Identity.defaultIdentityBasedOnUserIdsLoader.load(user.id)
}

const displayNameResolver = (user): string => {
  return getDisplayName(user)
}

// TODO loader
const teamsResolver = async (user): Promise<Team[]> => {
  return getUserTeams(user)
}

type UserUpdatedPayload = {
  userUpdated: User
}

const resolvers = {
  Query: {
    user: userResolver,
    users: usersResolver,
    currentUser: currentUserResolver,
  },
  Mutation: {
    activateUser: activateUserResolver,
    activateUsers: activateUsersResolver,
    deleteUser: deleteUserResolver,
    deleteUsers: deleteUsersResolver,
    deactivateUser: deactivateUserResolver,
    deactivateUsers: deactivateUsersResolver,
    updateUser: updateUserResolver,
    login: loginResolver,
    signUp: signUpResolver,
    setDefaultIdentity: setDefaultIdentityResolver,
    verifyEmail: verifyEmailResolver,
    resendVerificationEmail: resendVerificationEmailResolver,
    resendVerificationEmailAfterLogin:
      resendVerificationEmailAfterLoginResolver,
    updatePassword: updatePasswordResolver,
    sendPasswordResetEmail: sendPasswordResetEmailResolver,
    resetPassword: resetPasswordResolver,
  },
  User: {
    identities: identitiesResolver,
    defaultIdentity: defaultIdentityResolver,
    displayName: displayNameResolver,
    teams: teamsResolver,
  },
  Subscription: {
    userUpdated: {
      subscribe: async (
        ...args
      ): Promise<AsyncIterator<UserUpdatedPayload>> => {
        return withFilter(
          (): AsyncIterator<UserUpdatedPayload> => {
            return subscriptionManager.asyncIterator(USER_UPDATED)
          },
          (payload, variables) => {
            return variables?.userId === payload.userUpdated.id
          },
        )(...args)
      },
    },
  },
}

export default resolvers

const { withFilter } = require('graphql-subscriptions')

const logger = require('../../logger')
const subscriptionManager = require('../../graphql/pubsub')

const {
  labels: { USER_RESOLVER },
  subscriptions: { USER_UPDATED },
} = require('./constants')

const {
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
  resendVerificationEmailFromLogin,
  resendVerificationEmailAfterLogin,
  updatePassword,
  sendPasswordResetEmail,
  resetPassword,
  getDisplayName,
  getUserTeams,
} = require('./user.controller')

const {
  getUserIdentities,
  getDefaultIdentity,
} = require('../identity/identity.controller')

const userResolver = async (_, { id }) => {
  try {
    logger.info(`${USER_RESOLVER} user`)
    return getUser(id)
  } catch (e) {
    logger.error(`${USER_RESOLVER} user: ${e.message}`)
    throw new Error(e)
  }
}

const usersResolver = async (_, { filter, pagination }, ctx) => {
  try {
    logger.info(`${USER_RESOLVER} users`)
    return getUsers(filter, pagination)
  } catch (e) {
    logger.error(`${USER_RESOLVER} users: ${e.message}`)
    throw new Error(e)
  }
}

const currentUserResolver = async (_, __, ctx) => {
  try {
    logger.info(`${USER_RESOLVER} currentUser`)
    if (!ctx.userId) return null
    return getUser(ctx.userId)
  } catch (e) {
    logger.error(`${USER_RESOLVER} currentUser: ${e.message}`)
    throw new Error(e)
  }
}

const activateUserResolver = async (_, { id }) => {
  try {
    logger.info(`${USER_RESOLVER} activateUser`)
    return activateUser(id)
  } catch (e) {
    logger.error(`${USER_RESOLVER} activateUser: ${e.message}`)
    throw new Error(e)
  }
}

const activateUsersResolver = async (_, { ids }) => {
  try {
    logger.info(`${USER_RESOLVER} activateUsers`)
    return activateUsers(ids)
  } catch (e) {
    logger.error(`${USER_RESOLVER} activateUsers: ${e.message}`)
    throw new Error(e)
  }
}

const deleteUserResolver = async (_, { id }) => {
  try {
    logger.info(`${USER_RESOLVER} deleteUser`)
    return deleteUser(id)
  } catch (e) {
    logger.error(`${USER_RESOLVER} deleteUser: ${e.message}`)
    throw new Error(e)
  }
}

const deleteUsersResolver = async (_, { ids }) => {
  try {
    logger.info(`${USER_RESOLVER} deleteUsers`)
    return deleteUsers(ids)
  } catch (e) {
    logger.error(`${USER_RESOLVER} deleteUsers: ${e.message}`)
    throw new Error(e)
  }
}

const deactivateUserResolver = async (_, { id }) => {
  try {
    logger.info(`${USER_RESOLVER} deactivateUser`)
    return deactivateUser(id)
  } catch (e) {
    logger.error(`${USER_RESOLVER} deactivateUser: ${e.message}`)
    throw new Error(e)
  }
}

const deactivateUsersResolver = async (_, { ids }) => {
  try {
    logger.info(`${USER_RESOLVER} deactivateUsers`)
    return deactivateUsers(ids)
  } catch (e) {
    logger.error(`${USER_RESOLVER} deactivateUsers: ${e.message}`)
    throw new Error(e)
  }
}

const updateUserResolver = async (_, { id, input }) => {
  try {
    logger.info(`${USER_RESOLVER} updateUser`)
    return updateUser(id, input)
  } catch (e) {
    logger.error(`${USER_RESOLVER} updateUser: ${e.message}`)
    throw new Error(e)
  }
}

const loginResolver = async (_, { input }) => {
  try {
    logger.info(`${USER_RESOLVER} login`)
    return login(input)
  } catch (e) {
    logger.error(`${USER_RESOLVER} login: ${e.message}`)
    throw new Error(e)
  }
}

const signUpResolver = async (_, { input }) => {
  try {
    logger.info(`${USER_RESOLVER} signUp`)
    return signUp(input)
  } catch (e) {
    logger.error(`${USER_RESOLVER} signUp: ${e.message}`)
    throw new Error(e)
  }
}

const setDefaultIdentityResolver = async (_, { userId, identityId }) => {
  try {
    logger.info(`${USER_RESOLVER} setDefaultIdentity`)
    return setDefaultIdentity(userId, identityId)
  } catch (e) {
    logger.error(`${USER_RESOLVER} setDefaultIdentity: ${e.message}`)
    throw new Error(e)
  }
}

const verifyEmailResolver = async (_, { token }) => {
  try {
    logger.info(`${USER_RESOLVER} verifyEmail`)
    return verifyEmail(token)
  } catch (e) {
    logger.error(`${USER_RESOLVER} verifyEmail: ${e.message}`)
    throw new Error(e)
  }
}

const resendVerificationEmailResolver = async (_, { token }) => {
  try {
    logger.info(`${USER_RESOLVER} resendVerificationEmail`)
    return resendVerificationEmail(token)
  } catch (e) {
    logger.error(`${USER_RESOLVER} resendVerificationEmail: ${e.message}`)
    throw new Error(e)
  }
}

const resendVerificationEmailFromLoginResolver = async (
  _,
  { username, password },
) => {
  try {
    logger.info(`${USER_RESOLVER} resendVerificationEmailFromLogin`)
    return resendVerificationEmailFromLogin(username, password)
  } catch (e) {
    logger.error(
      `${USER_RESOLVER} resendVerificationEmailFromLogin: ${e.message}`,
    )
    throw new Error(e)
  }
}

const resendVerificationEmailAfterLoginResolver = async (_, __, ctx) => {
  try {
    logger.info(`${USER_RESOLVER} resendVerificationEmailAfterLogin`)
    return resendVerificationEmailAfterLogin(ctx.userId)
  } catch (e) {
    logger.error(
      `${USER_RESOLVER} resendVerificationEmailAfterLogin: ${e.message}`,
    )
    throw new Error(e)
  }
}

const updatePasswordResolver = async (_, { input }) => {
  try {
    logger.info(`${USER_RESOLVER} updatePassword`)
    const { id, currentPassword, newPassword } = input
    return updatePassword(id, currentPassword, newPassword)
  } catch (e) {
    logger.error(`${USER_RESOLVER} updatePassword: ${e.message}`)
    throw new Error(e)
  }
}

const sendPasswordResetEmailResolver = async (_, { email }) => {
  try {
    logger.info(`${USER_RESOLVER} sendPasswordResetEmail`)
    return sendPasswordResetEmail(email)
  } catch (e) {
    logger.error(`${USER_RESOLVER} sendPasswordResetEmail: ${e.message}`)
    throw new Error(e)
  }
}

const resetPasswordResolver = async (_, { token, password }) => {
  try {
    logger.info(`${USER_RESOLVER} resetPassword`)
    return resetPassword(token, password)
  } catch (e) {
    logger.error(`${USER_RESOLVER} resetPassword: ${e.message}`)
    throw new Error(e)
  }
}

const identitiesResolver = async (user, _) => {
  const identities = await getUserIdentities(user.id)
  return identities.result
  // return ctx.loaders.Identity.identitiesBasedOnUserIdsLoader.load(user.id)
}

const defaultIdentityResolver = async user => {
  return getDefaultIdentity(user.id)
  // return ctx.loaders.Identity.defaultIdentityBasedOnUserIdsLoader.load(user.id)
}

const displayNameResolver = async user => {
  return getDisplayName(user)
}

// TODO loader
const teamsResolver = async user => {
  return getUserTeams(user)
}

module.exports = {
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
    resendVerificationEmailFromLogin: resendVerificationEmailFromLoginResolver,
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
      subscribe: async (...args) => {
        return withFilter(
          () => {
            return subscriptionManager.asyncIterator(USER_UPDATED)
          },
          (payload, variables) => {
            const { userId } = variables
            const { userUpdated } = payload
            const { id } = userUpdated
            return userId === id
          },
        )(...args)
      },
    },
  },
}

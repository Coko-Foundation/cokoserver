const config = require('config')
const crypto = require('crypto')
const moment = require('moment')
const find = require('lodash/find')

const {
  AuthorizationError,
  ValidationError,
  ConflictError,
} = require('../../errors')

const logger = require('../../logger')
const authentication = require('../../authentication')
const User = require('./user.model')
const Identity = require('../identity/identity.model')
const useTransaction = require('../useTransaction')
const { displayNameConstructor } = require('../_helpers/utilities')

const createJWT = authentication.token.create

const {
  identityVerification,
  passwordUpdate,
  requestResetPassword,
  requestResetPasswordEmailNotFound,
} = require('../_helpers/emailTemplates')

const notify = require('../../services/notify')

const {
  notificationTypes: { EMAIL },
} = require('../../services/constants')

const {
  labels: { USER_CONTROLLER },
} = require('./constants')

const activateUser = async (id, options = {}) => {
  try {
    const { trx } = options
    return useTransaction(
      async tr => {
        logger.info(
          `${USER_CONTROLLER} activateUser: activating user with id ${id}`,
        )
        return User.activateUsers([id], { trx: tr })
      },
      { trx, passedTrxOnly: true },
    )
  } catch (e) {
    logger.error(`${USER_CONTROLLER} activateUser: ${e.message}`)
    throw new Error(e)
  }
}

const activateUsers = async (ids, options = {}) => {
  try {
    const { trx } = options
    return useTransaction(
      async tr => {
        logger.info(
          `${USER_CONTROLLER} activateUsers: activating users with ids ${ids}`,
        )

        return User.activateUsers(ids, { trx: tr })
      },
      { trx, passedTrxOnly: true },
    )
  } catch (e) {
    logger.error(`${USER_CONTROLLER} activateUsers: ${e.message}`)
    throw new Error(e)
  }
}

const getUser = async (id, options = {}) => {
  try {
    const { trx, ...restOptions } = options
    return useTransaction(
      async tr => {
        logger.info(`${USER_CONTROLLER} getUser: fetching user with id ${id}`)
        return User.findById(id, { trx: tr, ...restOptions })
      },
      { trx, passedTrxOnly: true },
    )
  } catch (e) {
    logger.error(`${USER_CONTROLLER} getUser: ${e.message}`)
    throw new Error(e)
  }
}

const getDisplayName = async user => {
  try {
    const { givenNames, surname, username } = user

    return displayNameConstructor(givenNames, surname, username)
  } catch (e) {
    logger.error(`${USER_CONTROLLER} getDisplayName: ${e.message}`)
    throw new Error(e)
  }
}

const getUsers = async (queryParams = {}, options = {}) => {
  try {
    const { trx, ...restOptions } = options
    return useTransaction(
      async tr => {
        logger.info(
          `${USER_CONTROLLER} getUsers: fetching all users based on provided options ${restOptions}`,
        )
        return User.find(queryParams, { trx: tr, ...restOptions })
      },
      { trx, passedTrxOnly: true },
    )
  } catch (e) {
    logger.error(`${USER_CONTROLLER} getUsers: ${e.message}`)
    throw new Error(e)
  }
}

const deleteUser = async (id, options = {}) => {
  return User.deleteById(id, { trx: options.trx })
}

const deleteUsers = async (ids, options = {}) => {
  return User.deleteByIds(ids)
}

const deactivateUser = async (id, options = {}) => {
  try {
    const { trx } = options
    return useTransaction(
      async tr => {
        logger.info(
          `${USER_CONTROLLER} deactivateUser: deactivating user with id ${id}`,
        )
        return User.deactivateUsers([id], { trx: tr })
      },
      { trx, passedTrxOnly: true },
    )
  } catch (e) {
    logger.error(`${USER_CONTROLLER} deactivateUser: ${e.message}`)
    throw new Error(e)
  }
}

const deactivateUsers = async (ids, options = {}) => {
  try {
    const { trx } = options
    return useTransaction(
      async tr => {
        logger.info(
          `${USER_CONTROLLER} deactivateUsers: deactivating users with id ${ids}`,
        )
        return User.deactivateUsers(ids, { trx: tr })
      },
      { trx, passedTrxOnly: true },
    )
  } catch (e) {
    logger.error(`${USER_CONTROLLER} deactivateUsers: ${e.message}`)
    throw new Error(e)
  }
}

const updateUser = async (id, data, options = {}) => {
  try {
    const { email, identityId, ...restData } = data
    const { trx, ...restOptions } = options
    logger.info(`${USER_CONTROLLER} updateUser: updating user with id ${id}`)

    return useTransaction(
      async tr => {
        if (!email) {
          return User.patchAndFetchById(
            id,
            { ...restData },
            {
              trx: tr,
              ...restOptions,
            },
          )
        }

        logger.info(
          `${USER_CONTROLLER} updateUser: updating user identity with provided email`,
        )

        if (!identityId) {
          throw new Error(
            `${USER_CONTROLLER} updateUser: cannot update email without identity id`,
          )
        }

        await Identity.patchAndFetchById(identityId, { email }, { trx: tr })

        if (Object.keys(restData).length !== 0) {
          logger.info(
            `${USER_CONTROLLER} updateUser: updating user with provided info`,
          )
          return User.patchAndFetchById(id, restData, {
            trx: tr,
            ...restOptions,
          })
        }

        return User.findById(id, {
          trx: tr,
          ...restOptions,
        })
      },
      { trx },
    )
  } catch (e) {
    logger.error(`${USER_CONTROLLER} updateUser: ${e.message}`)
    throw new Error(e)
  }
}

const login = async input => {
  try {
    let isValid = false
    let user

    const { username, email, password } = input

    if (!username) {
      logger.info(
        `${USER_CONTROLLER} login: searching for user with email ${email}`,
      )
      const identity = await Identity.findOne({ email })
      if (!identity) throw new AuthorizationError('Wrong username or password.')

      user = await User.findById(identity.userId)
    } else {
      logger.info(
        `${USER_CONTROLLER} login: searching for user with username ${username}`,
      )

      user = await User.findOne({ username })
      if (!user) throw new AuthorizationError('Wrong username or password.')
    }

    logger.info(
      `${USER_CONTROLLER} login: checking password validity for user with id ${user.id}`,
    )

    isValid = await user.isPasswordValid(password)

    if (!isValid) {
      throw new AuthorizationError('Wrong username or password.')
    }

    logger.info(`${USER_CONTROLLER} login: password is valid`)
    return {
      user,
      token: createJWT(user),
    }
  } catch (e) {
    logger.error(`${USER_CONTROLLER} login: ${e.message}`)
    throw new Error(e)
  }
}

const signUp = async (data, options = {}) => {
  try {
    const { email, ...restData } = data
    const { trx } = options

    return useTransaction(
      async tr => {
        if (restData.username) {
          const usernameExists = await User.findOne(
            { username: restData.username },
            { trx: tr },
          )

          if (usernameExists) {
            logger.error(`${USER_CONTROLLER} signUp: username already exists`)
            throw new ConflictError('Username already exists')
          }
        }

        const existingIdentity = await Identity.findOne({ email }, { trx: tr })

        if (existingIdentity) {
          const user = await User.findById(existingIdentity.userId, { trx: tr })

          if (user.agreedTc) {
            logger.error(
              `${USER_CONTROLLER} signUp: a user with this email already exists`,
            )
            throw new ConflictError('A user with this email already exists')
          }

          // If not agreed to tc, user's been invited but is now signing up
          logger.info(
            `${USER_CONTROLLER} signUp: connecting user with identity`,
          )

          const updatedUser = await User.patchAndFetchById(
            existingIdentity.userId,
            {
              ...restData,
            },
            { trx: tr },
          )

          const verificationToken = crypto.randomBytes(64).toString('hex')
          const verificationTokenTimestamp = new Date()

          existingIdentity.patch(
            { verificationToken, verificationTokenTimestamp },
            { trx: tr },
          )

          const emailData = identityVerification({
            verificationToken,
            email: existingIdentity.email,
          })

          notify(EMAIL, emailData)
          return updatedUser.id
        }

        logger.info(`${USER_CONTROLLER} signUp: creating user`)

        const newUser = await User.insert(
          {
            ...restData,
          },
          { trx: tr },
        )

        const verificationToken = crypto.randomBytes(64).toString('hex')
        const verificationTokenTimestamp = new Date()

        logger.info(
          `${USER_CONTROLLER} signUp: creating user local identity with provided email`,
        )

        await Identity.insert(
          {
            userId: newUser.id,
            email,
            isSocial: false,
            verificationTokenTimestamp,
            verificationToken,
            isVerified: false,
            isDefault: true,
          },
          { trx: tr },
        )

        const emailData = identityVerification({
          verificationToken,
          email,
        })

        notify(EMAIL, emailData)

        return newUser.id
      },
      { trx },
    )
  } catch (e) {
    logger.error(`${USER_CONTROLLER} signUp: ${e.message}`)
    throw new Error(e)
  }
}

const verifyEmail = async (token, options = {}) => {
  try {
    const { trx } = options
    logger.info(`${USER_CONTROLLER} verifyEmail: verifying user email`)
    return useTransaction(
      async tr => {
        const identity = await Identity.findOne(
          {
            verificationToken: token,
          },
          { trx: tr },
        )

        const emailVerificationTokenExpiry = config.has(
          'emailVerificationTokenExpiry',
        )
          ? {
              amount: config.get('emailVerificationTokenExpiry.amount'),
              unit: config.get('emailVerificationTokenExpiry.unit'),
            }
          : {
              amount: 24,
              unit: 'hours',
            }

        if (!identity)
          throw new Error(`${USER_CONTROLLER} verifyEmail: invalid token`)

        if (identity.isVerified)
          throw new Error(
            `${USER_CONTROLLER} verifyEmail: identity has already been confirmed`,
          )

        if (!identity.verificationTokenTimestamp) {
          throw new Error(
            `${USER_CONTROLLER} verifyEmail: confirmation token does not have a corresponding timestamp`,
          )
        }

        if (
          moment()
            .subtract(
              emailVerificationTokenExpiry.amount,
              emailVerificationTokenExpiry.unit,
            )
            .isAfter(identity.verificationTokenTimestamp)
        ) {
          throw new Error(`${USER_CONTROLLER} verifyEmail: Token expired`)
        }

        await identity.patch(
          {
            isVerified: true,
          },
          { trx: tr },
        )

        await activateUser(identity.userId, { trx: tr })

        return true
      },
      { trx },
    )
  } catch (e) {
    logger.error(`${USER_CONTROLLER} verifyEmail: ${e.message}`)
    throw new Error(e)
  }
}

const resendVerificationEmailCommon = async (identity, options = {}) => {
  const verificationToken = crypto.randomBytes(64).toString('hex')
  const verificationTokenTimestamp = new Date()

  await identity.patch(
    {
      verificationToken,
      verificationTokenTimestamp,
    },
    { trx: options.trx },
  )

  const emailData = identityVerification({
    verificationToken,
    email: identity.email,
  })

  notify(EMAIL, emailData)
}

const resendVerificationEmail = async (token, options = {}) => {
  try {
    logger.info(
      `${USER_CONTROLLER} resendVerificationEmail: resending verification email to user`,
    )

    const identity = await Identity.findOne(
      {
        verificationToken: token,
      },
      { trx: options.trx },
    )

    if (!identity)
      throw new Error(
        `${USER_CONTROLLER} resendVerificationEmail: Token does not correspond to an identity`,
      )

    await resendVerificationEmailCommon(identity, options)
    return true
  } catch (e) {
    logger.error(`${USER_CONTROLLER} resendVerificationEmail: ${e.message}`)
    throw e
  }
}

const resendVerificationEmailAfterLogin = async (userId, options = {}) => {
  try {
    logger.info(
      `${USER_CONTROLLER} resendVerificationEmailAfterLogin: resending verification email to user`,
    )

    const identity = await Identity.findOne(
      {
        userId,
        isDefault: true,
      },
      { trx: options.trx },
    )

    await resendVerificationEmailCommon(identity, options)
    return true
  } catch (e) {
    logger.error(`${USER_CONTROLLER} resendVerificationEmail: ${e.message}`)
    throw e
  }
}

const updatePassword = async (id, currentPassword, newPassword) => {
  try {
    logger.info(`${USER_CONTROLLER} updatePassword: updating user password`)

    await User.updatePassword(id, currentPassword, newPassword, undefined)

    const identity = await Identity.findOne({ isDefault: true, userId: id })

    const emailData = passwordUpdate({
      email: identity.email,
    })

    notify(EMAIL, emailData)

    return true
  } catch (e) {
    logger.error(`${USER_CONTROLLER} updatePassword: ${e.message}`)
    throw new Error(e)
  }
}

const sendPasswordResetEmail = async (email, options = {}) => {
  try {
    const { trx } = options
    return useTransaction(
      async tr => {
        const identity = await Identity.findOne(
          {
            isDefault: true,
            email: email.toLowerCase(),
          },
          { trx: tr },
        )

        if (!identity) {
          const emailData = requestResetPasswordEmailNotFound({
            email: email.toLowerCase(),
          })

          notify(EMAIL, emailData)
          return true
        }

        const user = await User.findById(identity.userId, { trx: tr })

        const resetToken = crypto.randomBytes(32).toString('hex')

        await user.patch(
          {
            passwordResetTimestamp: new Date(),
            passwordResetToken: resetToken,
          },
          { trx: tr },
        )

        logger.info(
          `${USER_CONTROLLER} sendPasswordResetEmail: sending password reset email`,
        )

        const emailData = requestResetPassword({
          email: email.toLowerCase(),
          token: resetToken,
        })

        notify(EMAIL, emailData)

        return true
      },
      { trx, passedTrxOnly: true },
    )
  } catch (e) {
    logger.error(`${USER_CONTROLLER} sendPasswordResetEmail: ${e.message}`)
    throw new Error(e)
  }
}

const resetPassword = async (token, password, options = {}) => {
  try {
    const { trx } = options
    logger.info(`${USER_CONTROLLER} resetPassword: resetting user password`)
    return useTransaction(
      async tr => {
        const user = await User.findOne(
          { passwordResetToken: token },
          { trx: tr, related: 'defaultIdentity' },
        )

        if (!user) {
          throw new Error(
            `${USER_CONTROLLER} resetPassword: no user found with token ${token}`,
          )
        }

        const passwordResetTokenExpiry = config.has('passwordResetTokenExpiry')
          ? {
              amount: config.get('passwordResetTokenExpiry.amount'),
              unit: config.get('passwordResetTokenExpiry.unit'),
            }
          : {
              amount: 24,
              unit: 'hours',
            }

        if (
          moment()
            .subtract(
              passwordResetTokenExpiry.amount,
              passwordResetTokenExpiry.unit,
            )
            .isAfter(user.passwordResetTimestamp)
        ) {
          throw new ValidationError(
            `${USER_CONTROLLER} resetPassword: your token has expired`,
          )
        }

        await user.updatePassword(
          undefined,
          password,
          user.passwordResetToken,
          { trx: tr },
        )

        await user.patch(
          {
            passwordResetTimestamp: null,
            passwordResetToken: null,
          },
          { trx: tr },
        )

        const emailData = passwordUpdate({
          email: user.defaultIdentity.email,
        })

        notify(EMAIL, emailData)

        return true
      },
      { trx, passedTrxOnly: true },
    )
  } catch (e) {
    logger.error(`${USER_CONTROLLER} resetPassword: ${e.message}`)
    throw new Error(e)
  }
}

const setDefaultIdentity = async (userId, identityId, options = {}) => {
  try {
    const { trx } = options
    return useTransaction(
      async tr => {
        const user = await User.findById(
          userId,
          {
            related: 'identities',
          },
          { trx: tr },
        )

        const { identities } = user
        const previouslyDefault = find(identities, { isDefault: true })

        if (previouslyDefault && previouslyDefault.id === identityId) {
          return user
        }

        if (previouslyDefault) {
          await Identity.patchAndFetchById(
            previouslyDefault.id,
            { isDefault: false },
            { trx: tr },
          )
        }

        await Identity.patchAndFetchById(
          identityId,
          { isDefault: true },
          { trx: tr },
        )
        return user
      },
      { trx, passedTrxOnly: true },
    )
  } catch (e) {
    logger.error(`${USER_CONTROLLER} setDefaultIdentity: ${e.message}`)
    throw new Error(e)
  }
}

const getUserTeams = user => {
  try {
    const { id } = user
    return User.getTeams(id)
  } catch (e) {
    logger.error(`${USER_CONTROLLER} getUserTeams: ${e.message}`)
    throw new Error(e)
  }
}

module.exports = {
  activateUser,
  activateUsers,
  deactivateUser,
  deactivateUsers,
  deleteUser,
  deleteUsers,
  getDisplayName,
  getUser,
  getUsers,
  getUserTeams,
  login,
  updateUser,
  updatePassword,
  resetPassword,
  resendVerificationEmail,
  resendVerificationEmailAfterLogin,
  setDefaultIdentity,
  sendPasswordResetEmail,
  signUp,
  verifyEmail,
}

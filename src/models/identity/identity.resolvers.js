const logger = require('../../logger')
const subscriptionManager = require('../../graphql/pubsub')

const {
  createOAuthIdentity,
  hasValidRefreshToken,
} = require('./identity.controller')

const { getUser } = require('../user/user.controller')

const {
  labels: { IDENTITY_RESOLVER },
} = require('./constants')

const {
  subscriptions: { USER_UPDATED },
} = require('../user/constants')

const createOAuthIdentityResolver = async (
  _,
  { provider, sessionState, code },
  ctx,
) => {
  try {
    logger.info(`${IDENTITY_RESOLVER} createOAuthIdentity`)
    const { userId } = ctx

    const identity = await createOAuthIdentity(
      userId,
      provider,
      sessionState,
      code,
    )

    const user = await getUser(userId)

    subscriptionManager.publish(USER_UPDATED, {
      userUpdated: user,
    })

    return identity
  } catch (e) {
    logger.error(`${IDENTITY_RESOLVER} createOAuthIdentity: ${e.message}`)
    throw new Error(e)
  }
}

module.exports = {
  Mutation: {
    createOAuthIdentity: createOAuthIdentityResolver,
  },
  Identity: {
    hasValidRefreshToken,
  },
}

import logger from '../../logger'
import subscriptionManager from '../../graphql/pubsub'

import {
  createOAuthIdentity,
  hasValidRefreshToken,
} from './identity.controller'

import { getUser } from '../user/user.controller'

import { labels } from './constants'
import { subscriptions } from '../user/constants'

const { IDENTITY_RESOLVER } = labels
const { USER_UPDATED } = subscriptions

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
    throw e
  }
}

const resolvers = {
  Mutation: {
    createOAuthIdentity: createOAuthIdentityResolver,
  },
  Identity: {
    hasValidRefreshToken,
  },
}

export default resolvers

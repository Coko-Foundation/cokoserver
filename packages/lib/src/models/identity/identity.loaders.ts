import logger from '../../logger'
import Identity from './identity.model'
import { labels } from './constants'

const { IDENTITY_LOADER } = labels

const identitiesBasedOnUserIdsLoader = async userIds => {
  try {
    const userIdentities = await Identity.query().whereIn('userId', userIds)
    return userIds.map(userId =>
      userIdentities.filter(identity => identity.userId === userId),
    )
  } catch (e) {
    logger.error(
      `${IDENTITY_LOADER} identitiesBasedOnUserIdsLoader: ${e.message}`,
    )
    throw e
  }
}

const defaultIdentityBasedOnUserIdsLoader = async userIds => {
  try {
    const userIdentities = await Identity.query()
      .whereIn('userId', userIds)
      .andWhere({ isDefault: true })

    return userIds.map(userId =>
      userIdentities.find(identity => identity.userId === userId),
    )
  } catch (e) {
    logger.error(
      `${IDENTITY_LOADER} defaultIdentityBasedOnUserIdsLoader: ${e.message}`,
    )
    throw e
  }
}

export { identitiesBasedOnUserIdsLoader, defaultIdentityBasedOnUserIdsLoader }

const moment = require('moment')

const Identity = require('../models/identity/identity.model')
const User = require('../models/user/user.model')
const userConstants = require('../models/user/constants')
const subscriptionManager = require('../graphql/pubsub')

const { USER_UPDATED } = userConstants.subscriptions

const defaultJobQueueNames = {
  // RENEW_AUTH_TOKENS_JOB: 'renew-auth-tokens',
  REFRESH_TOKEN_EXPIRED: 'refresh-token-expired',
}

const defaultJobQueues = [
  // {
  //   name: defaultJobQueueNames.RENEW_AUTH_TOKENS_JOB,
  //   handler: async job => {
  //     const bufferTime = 24 * 3600
  //     const { userId, providerLabel } = job.data

  //     try {
  //       await renewAuthTokens(userId, providerLabel)
  //       job.done()
  //     } catch (e) {
  //       logger.error(`Job ${defaultJobQueueNames.RENEW_AUTH_TOKENS_JOB}: callback error:`, e)
  //       throw e
  //     }

  //       // Schedule auth renewal
  //       const { oauthRefreshTokenExpiration } = await Identity.findOne({
  //         userId,
  //         provider: providerLabel,
  //       })

  //       const expiresIn = (oauthRefreshTokenExpiration - moment().utc()) / 1000

  //       const renewAfter = expiresIn - bufferTime

  //       if (renewAfter < 0) {
  //         throw new Error('"renewAfter" is less than 0')
  //       }

  //       await jobManager.sendToQueue(defaultJobQueueNames.RENEW_AUTH_TOKENS_JOB, { userId, providerLabel }, { startAfter: renewAfter })
  //   },
  // },

  /**
   * Triggers the user updated subscription when the user's refresh token has
   * expired. (refresh token being for a social identity)
   */
  {
    name: defaultJobQueueNames.REFRESH_TOKEN_EXPIRED,
    handler: async job => {
      const { userId, providerLabel } = job.data
      const user = await User.findById(userId)

      const providerUserIdentity = await Identity.findOne({
        userId,
        provider: providerLabel,
      })

      if (!providerUserIdentity) {
        throw new Error(
          `Refresh token expired job: Identity for user with id ${userId} does not exist for provider ${providerLabel}`,
        )
      }

      const { oauthRefreshTokenExpiration } = providerUserIdentity
      const UTCNowTimestamp = moment().utc().toDate().getTime()

      const refreshTokenExpired =
        oauthRefreshTokenExpiration.getTime() < UTCNowTimestamp

      if (refreshTokenExpired) {
        subscriptionManager.publish(USER_UPDATED, {
          userUpdated: user,
        })
      }
    },
  },
]

module.exports = { defaultJobQueueNames, defaultJobQueues }

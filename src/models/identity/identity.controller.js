const axios = require('axios')
const config = require('config')
const moment = require('moment')

const logger = require('../../logger')
const pubsubManager = require('../../graphql/pubsub')
const { getExpirationTime, foreverDate } = require('../../utils/time')
const { jobs } = require('../../services')
const { getUser } = require('../user/user.controller')
const Identity = require('./identity.model')

const {
  subscriptions: { USER_UPDATED },
} = require('../user/constants')

const {
  labels: { IDENTITY_CONTROLLER },
} = require('./constants')

const envUtils = require('../../utils/env')

const getUserIdentities = async userId => {
  try {
    return Identity.find({ userId })
  } catch (e) {
    throw new Error(e)
  }
}

const getDefaultIdentity = async userId => {
  try {
    return Identity.findOne({
      userId,
      isDefault: true,
    })
  } catch (e) {
    throw new Error(e)
  }
}

const hasValidRefreshToken = identity => {
  const { oauthRefreshTokenExpiration, oauthRefreshToken } = identity
  const UTCNowTimestamp = moment().utc().toDate().getTime()

  return (
    !!oauthRefreshToken &&
    !!oauthRefreshTokenExpiration &&
    oauthRefreshTokenExpiration.getTime() > UTCNowTimestamp
  )
}

/**
 * Authorise user OAuth.
 * Save OAuth access and refresh tokens.
 * Trigger subscription indicating the identity has changed.
 */
const createOAuthIdentity = async (userId, provider, sessionState, code) => {
  // Throw error if unable to acquire and then store authorisation
  try {
    let identity = await Identity.findOne({ userId, provider })

    if (identity && hasValidRefreshToken(identity)) {
      return identity
    }

    const { ...authData } = await authorizeOAuth(provider, sessionState, code)

    const {
      email,
      given_name: givenNames,
      family_name: surname,
      sub: providerUserId,
    } = JSON.parse(
      Buffer.from(authData.oauthAccessToken.split('.')[1], 'base64').toString(),
    )

    if (!identity) {
      identity = await Identity.insert({
        email,
        provider,
        userId,
        profileData: {
          givenNames,
          surname,
          providerUserId,
        },
        ...authData,
      })
    } else {
      identity = await Identity.patchAndFetchById(identity.id, { ...authData })
    }

    const { oauthRefreshTokenExpiration } = authData

    if (oauthRefreshTokenExpiration.getTime() !== foreverDate.getTime()) {
      const expiresIn = (oauthRefreshTokenExpiration - moment().utc()) / 1000

      await jobs.defer(
        jobs.REFRESH_TOKEN_EXPIRED,
        { seconds: expiresIn },
        { userId, providerLabel: provider },
      )
    }

    return identity
  } catch (e) {
    logger.error(`${IDENTITY_CONTROLLER} createOAuthIdentity: ${e.message}`)
    throw e
  }
}

/** authorizeOAuth
 * Send an Oauth2 authorisation code requesting access and refresh tokens.
 * Return the validated tokens or throw an error.
 */
const authorizeOAuth = async (provider, sessionState, code) => {
  const tokenUrl = config.get(`integrations.${provider}.tokenUrl`)
  const clientId = config.get(`integrations.${provider}.clientId`)
  const redirectUri = config.get(`integrations.${provider}.redirectUri`)

  const postData = {
    code,
    grant_type: 'authorization_code',
    session_state: sessionState,
    client_id: clientId,
    redirect_uri: redirectUri,
  }

  const params = new URLSearchParams(postData)

  // Get tokens
  const { data } = await axios({
    method: 'POST',
    url: tokenUrl,
    data: params.toString(),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  if (data.token_type?.toLowerCase() !== 'bearer') {
    throw new Error(`Invalid "token_type": ${data.token_type}`)
  }

  if (data.session_state !== sessionState) {
    throw new Error(`Invalid "session_state": ${data.session_state}`)
  }

  /* eslint-disable camelcase */
  const { access_token, expires_in, refresh_token, refresh_expires_in } = data

  if (!access_token) {
    throw new Error('Missing access_token from response!')
  }

  if (envUtils.isValidPositiveIntegerOrZero(expires_in)) {
    throw new Error('Missing expires_in from response!')
  }

  if (!refresh_token) {
    throw new Error('Missing refresh_token from response!')
  }

  if (envUtils.isValidPositiveIntegerOrZero(refresh_expires_in)) {
    throw new Error('Missing refresh_expires_in from response!')
  }

  return {
    oauthAccessToken: access_token,
    oauthRefreshToken: refresh_token,
    oauthAccessTokenExpiration:
      expires_in === 0 ? foreverDate : getExpirationTime(expires_in),
    oauthRefreshTokenExpiration:
      refresh_expires_in === 0
        ? foreverDate
        : getExpirationTime(refresh_expires_in),
  }
  /* eslint-enable camelcase */
}

const invalidateProviderAccessToken = async (userId, providerLabel) => {
  const providerUserIdentity = await Identity.findOne({
    userId,
    provider: providerLabel,
  })

  await Identity.patchAndFetchById(providerUserIdentity.id, {
    oauthAccessTokenExpiration: moment().utc().toDate(),
  })

  logger.info(
    `access token for provider ${providerLabel} became invalid, trying to get a new one via the refresh token`,
  )
}

const invalidateProviderTokens = async (userId, providerLabel) => {
  const pubsub = await pubsubManager.getPubsub()

  const updatedUser = await getUser(userId)

  const providerUserIdentity = await Identity.findOne({
    userId,
    provider: providerLabel,
  })

  await Identity.patchAndFetchById(providerUserIdentity.id, {
    oauthAccessTokenExpiration: moment().utc().toDate(),
    oauthRefreshTokenExpiration: moment().utc().toDate(),
  })

  pubsub.publish(USER_UPDATED, {
    userUpdated: updatedUser,
  })

  logger.error(
    `refresh token for provider ${providerLabel} became invalid, authorization flow (provider login) should be followed by the user`,
  )
}

module.exports = {
  createOAuthIdentity,
  getUserIdentities,
  getDefaultIdentity,
  hasValidRefreshToken,
  invalidateProviderAccessToken,
  invalidateProviderTokens,
}

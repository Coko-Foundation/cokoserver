const get = require('lodash/get')
const config = require('config')
const axios = require('axios')
const moment = require('moment')

const pubsubManager = require('../graphql/pubsub')

const { getExpirationTime, foreverDate } = require('./time')

const {
  subscriptions: { USER_UPDATED },
} = require('../models/user/constants')

const Identity = require('../models/identity/identity.model')
const ServiceCredential = require('../models/serviceCredential/serviceCredential.model')

const { getUser } = require('../models/user/user.controller')

const {
  invalidateProviderTokens,
} = require('../models/identity/identity.controller')

const envUtils = require('./env')

const getAuthTokens = async (userId, providerLabel) => {
  return requestTokensFromProvider(userId, providerLabel, {
    checkAccessToken: true,
    returnAccessToken: true,
  })
}

const requestTokensFromProvider = async (
  userId,
  providerLabel,
  options = {},
) => {
  const pubsub = await pubsubManager.getPubsub()
  const { checkAccessToken, returnAccessToken } = options

  const providerUserIdentity = await Identity.findOne({
    userId,
    provider: providerLabel,
  })

  if (!providerUserIdentity) {
    throw new Error(`identity for provider ${providerLabel} does not exist`)
  }

  const {
    oauthAccessToken,
    oauthAccessTokenExpiration,
    oauthRefreshToken,
    oauthRefreshTokenExpiration,
  } = providerUserIdentity

  const UTCNowTimestamp = moment().utc().toDate().getTime()

  if (checkAccessToken) {
    const accessTokenExpired =
      oauthAccessTokenExpiration.getTime() < UTCNowTimestamp

    if (!accessTokenExpired) {
      return oauthAccessToken
    }
  }

  const refreshTokenExpired =
    oauthRefreshTokenExpiration.getTime() < UTCNowTimestamp

  if (refreshTokenExpired) {
    const updatedUser = await getUser(userId)

    pubsub.publish(USER_UPDATED, {
      userUpdated: updatedUser,
    })
    // logger.error(
    //   `refresh token for provider ${providerLabel} expired, authorization flow should (provider login) be followed by the user`,
    // )
    // return false
    throw new Error(
      `refresh token for provider ${providerLabel} expired, authorization flow should (provider login) be followed by the user`,
    )
  }

  const integrations = config.has('integrations') && config.get('integrations')

  if (!integrations) {
    throw new Error('Integrations are undefined in config')
  }

  const externalProvider = integrations[providerLabel]

  if (!externalProvider) {
    throw new Error(`Integration ${providerLabel} configuration is undefined `)
  }

  const { tokenUrl, clientId } = integrations[providerLabel]

  if (!tokenUrl) {
    throw new Error(`Integration ${providerLabel} tokenUrl is undefined `)
  }

  if (!clientId) {
    throw new Error(`Integration ${providerLabel} clientId is undefined `)
  }

  const tokenData = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: oauthRefreshToken,
    client_id: clientId,
  })

  const { data, status } = await axios({
    method: 'post',
    url: tokenUrl,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    data: tokenData.toString(),
  })

  if (status === 401) {
    // for the case that something happened and refreshToken become invalid -> set that expired
    await invalidateProviderTokens(userId, providerLabel)
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

  await Identity.patchAndFetchById(providerUserIdentity.id, {
    oauthAccessToken: access_token,
    oauthRefreshToken: refresh_token,
    oauthAccessTokenExpiration:
      expires_in === 0 ? foreverDate : getExpirationTime(expires_in),
    oauthRefreshTokenExpiration:
      refresh_expires_in === 0
        ? foreverDate
        : getExpirationTime(refresh_expires_in),
  })

  if (returnAccessToken) {
    return access_token
  }

  return true
}

const renewAuthTokens = async (userId, providerLabel) =>
  requestTokensFromProvider(userId, providerLabel, { checkAccessToken: false })

const getAccessToken = async (serviceName, renew = false) => {
  try {
    const services = config.has('services') && config.get('services')

    if (!services) {
      throw new Error('services are undefined')
    }

    const service = get(services, `${serviceName}`)

    if (!service) {
      throw new Error(`service ${serviceName} configuration is undefined `)
    }

    const { clientId, clientSecret, url } = service

    if (!clientId) {
      throw new Error(`service ${serviceName} clientId is undefined `)
    }

    if (!clientSecret) {
      throw new Error(`service ${serviceName} clientSecret is undefined `)
    }

    if (!url) {
      throw new Error(`service ${serviceName} url is undefined `)
    }

    const buff = Buffer.from(`${clientId}:${clientSecret}`, 'utf8')
    const base64data = buff.toString('base64')

    const serviceHealthCheck = await axios({
      method: 'get',
      url: `${url}/healthcheck`,
    })

    const { data: healthCheckData } = serviceHealthCheck
    const { message } = healthCheckData

    if (message !== 'Coolio') {
      throw new Error(`service ${serviceName} is down`)
    }

    const foundServiceCredential = await ServiceCredential.findOne({
      name: serviceName,
    })

    if (!foundServiceCredential) {
      const { data } = await axios({
        method: 'post',
        url: `${url}/api/auth`,
        headers: { authorization: `Basic ${base64data}` },
      })

      const { accessToken } = data
      await ServiceCredential.insert({
        name: serviceName,
        accessToken,
      })
      return accessToken
    }

    const { accessToken, id } = foundServiceCredential

    if (!accessToken || renew) {
      const { data } = await axios({
        method: 'post',
        url: `${url}/api/auth`,
        headers: { authorization: `Basic ${base64data}` },
      })

      const { accessToken: freshAccessToken } = data
      await ServiceCredential.patchAndFetchById(id, {
        accessToken: freshAccessToken,
      })
      return freshAccessToken
    }

    return accessToken
  } catch (e) {
    const foundServiceCredential = await ServiceCredential.findOne({
      name: serviceName,
    })

    if (foundServiceCredential) {
      await ServiceCredential.patchAndFetchById(foundServiceCredential.id, {
        accessToken: null,
      })
    }

    throw new Error(e)
  }
}

module.exports = {
  getAuthTokens,
  getAccessToken,
  renewAuthTokens,
}

import { invalidateProviderAccessToken } from '../models/identity/identity.controller'

import makeCall from './makeCall'
import { getAuthTokens } from './tokens'

const authenticatedCall = async (userId, providerLabel, callParameters) => {
  try {
    if (!callParameters) throw new Error(`Call parameters are required`)

    const accessToken = await getAuthTokens(userId, providerLabel)

    const response = await makeCall(callParameters, accessToken)

    if (response.status === 401) {
      // for the case that something happened and accessToken become invalid -> set that expired
      await invalidateProviderAccessToken(userId, providerLabel)

      const freshAccessToken = await getAuthTokens(userId, providerLabel)

      return makeCall(callParameters, freshAccessToken)
    }

    return response
  } catch (e) {
    throw new Error(e)
  }
}

export { authenticatedCall, getAuthTokens }

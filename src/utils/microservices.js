const axios = require('axios')
const clone = require('lodash/clone')

const getAccessToken = require('./getAccessToken')

/**
 * Calls given microservice, while taking care of authentication for you.
 * Services need to be defined in the config.
 *
 * First, on the service container, you need to generate a client id & secret,
 * then add these variables as credentials in the environment file of your app.
 *
 * This function will:
 * - Grab those variables from the environment / config
 * - Communicate with the service to get authenticated and get an access token
 * - Store the access token on the ServiceCredential table
 * - Make a call to the service with the parameters you gave it
 *
 * If the access token exists already, it will be used without calling the
 * service for a new one.
 *
 * If the access token exists, but has expired, this is also handled
 * automatically by getting a new token from the service.
 *
 * Other errors will be thrown and should be handled by your app logic.
 */

const callMicroservice = async (serviceName, callParameters) => {
  try {
    if (!callParameters)
      throw new Error(
        `communication parameters needed for calling ${serviceName} microservice`,
      )

    const makeCall = async token => {
      const axiosParams = clone(callParameters)
      const { headers } = axiosParams

      if (!headers) {
        axiosParams.headers = {
          authorization: `Bearer ${token}`,
        }
      } else {
        axiosParams.headers.authorization = `Bearer ${token}`
      }

      return axios(axiosParams)
    }

    const accessToken = await getAccessToken(serviceName)

    return makeCall(accessToken).catch(async err => {
      const { response } = err

      if (!response) {
        throw new Error(`Request failed with message: ${err.code}`)
      }

      const { status, data } = response
      const { msg } = data

      if (status === 401 && msg === 'expired token') {
        const freshToken = await getAccessToken(serviceName, true)
        return makeCall(freshToken)
      }

      throw new Error(err)
    })
  } catch (e) {
    throw new Error(e)
  }
}

module.exports = {
  callMicroservice,
  getAccessToken,
}

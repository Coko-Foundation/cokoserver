import axios from 'axios'
import axiosRetry from 'axios-retry'

const request = (options = {}) => {
  const { retries, retryDelay } = options

  axiosRetry(axios, {
    retries: retries || 0,
    retryDelay: retryCount => {
      // console.log(`Retry attempt: ${retryCount}`)
      return retryCount * (retryDelay || 1000) // Exponential backoff
    },
    retryCondition: error => {
      // Retry on network errors or 5xx responses
      return error.response?.status >= 500 || axiosRetry.isNetworkError(error)
    },
  })

  return axios(options)
}

export default request

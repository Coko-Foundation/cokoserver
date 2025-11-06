import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import axiosRetry from 'axios-retry'

type RequestOptions = {
  retries?: number
  retryDelay?: number
}

type CombinedRequestOptions = AxiosRequestConfig & RequestOptions

const request = (
  options: CombinedRequestOptions = {},
): Promise<AxiosResponse> => {
  const { retries, retryDelay, ...restOptions } = options

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

  return axios(restOptions)
}

export default request

import axios, { AxiosResponse } from 'axios'
import clone from 'lodash/clone'

const makeCall = async (
  callParameters: any,
  token: string,
): Promise<AxiosResponse> => {
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

export default makeCall

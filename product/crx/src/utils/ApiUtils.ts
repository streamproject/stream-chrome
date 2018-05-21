import axios, { AxiosError } from 'axios'
import {
  AuthModels,
  PlatformModels,
  TxModels,
  UserModels,
} from 'shared/dist/models'
import * as Errors from 'shared/dist/models/Errors'
import { format, parse, Url } from 'url'
import { BASE_URL, GOOGLE_CLIENT_ID, TWITCH_CLIENT_ID } from '../constants/config'
import { ACCESS_TOKEN, getToken, removeToken, RFERESH_TOKEN, setToken } from './AuthTokenUtils'

// HACK to make it simpler to include/update oauth2 tokens
export async function includeTokenWithRequest(config: any) {
  const token = await getToken(ACCESS_TOKEN)

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
}

export async function handleResponse(response: any) {
  if (response.data) {
    if (response.data.refresh_token) {
      await setToken(RFERESH_TOKEN, response.data.refresh_token)
    }

    if (response.data.access_token) {
      await setToken(ACCESS_TOKEN, response.data.access_token)
    }
  }

  return response
}

export async function handleResponseError(error: AxiosError & { config: { _retry?: boolean }}) {
  const originalRequest = error.config
  const refreshToken = await getToken(RFERESH_TOKEN)

  if (!error.response) {
    return Promise.reject(Errors.CrxErrors.NETWORK_ERROR)
  }

  if (error.response.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true

    const accessTokenResponse = await authorizedInstance.post(
      '/auth/token',
      { refresh_token: refreshToken, grant_type: 'refresh_token' },
    )

    setToken(ACCESS_TOKEN, accessTokenResponse.data.access_token)
    originalRequest.headers.Authorization = `Bearer ${accessTokenResponse.data.access_token}`

    return authorizedInstance.request(originalRequest)
  } else if (error.response.status === 403 && refreshToken) {
    removeToken(RFERESH_TOKEN)
    removeToken(ACCESS_TOKEN)

    return Promise.reject(error)
  }

  return Promise.reject(error.response.data)
}

export const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
})

export const authorizedInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
})

instance.interceptors.response.use(handleResponse, handleResponseError)
authorizedInstance.interceptors.request.use(includeTokenWithRequest)
authorizedInstance.interceptors.response.use(handleResponse, handleResponseError)

// TODO: Refactor into separate api utils for each controller...?
export const objToFormData = (obj: any) => {
  const formData = new FormData()

  Object.keys(obj).forEach((key) => formData.append(key, obj[key]))

  return formData
}

export const objectUrlToFile = async (objectUrl: string) => {
  const response = await axios.get(objectUrl, { responseType: 'blob' })
  return response.data as Blob
}

export const auth = {
  async login(
    data: { username: string, password: string },
  ) {
    const response = await instance.post(
      'auth/login',
      Object.assign(
        data,
        { grant_type: 'password' },
      ),
    )
    response.data = AuthModels.serialize(response.data.user, response.data.access_token, response.data.refresh_token)
    return response
  },

  checkSignup(
    data: { username: string, email: string, password: string, referrerCode: string },
  ) {
    return instance.post<AuthModels.AuthResponse>('auth/checkSignup', data)
  },

  signup(
    data: { username: string, email: string, password: string, referrerCode: string },
  ) {
    return instance.post<AuthModels.AuthResponse>('auth/signup', data)
  },

  logout() {
    return authorizedInstance.post<AuthModels.AuthResponse>('auth/logout')
  },
}

export const user = {
  getMe() {
    return authorizedInstance.get<UserModels.UserResponse>('user/me')
  },

  getFromPlatform(platformId: string, platformType: PlatformModels.PlatformTypes) {
    return authorizedInstance.get<UserModels.UserResponse>(`user/${platformType}/${platformId}`)
  },

  verify(
    data: { nationalNumber: string, countryCode: string },
  ) {
    return authorizedInstance.post<UserModels.AuthyVerifyResponse>('user/verify', data)
  },

  check(
    data: { verificationCode: string, nationalNumber: string, countryCode: string },
  ) {
    return authorizedInstance.post<UserModels.AuthyCheckResponse>(
      'user/check',
      data,
    )
  },

  update(
    data: { password: string, newPassword?: string, profPic?: Blob, address?: string, email?: string },
  ) {
    // TODO: Change this back to form data after setting up multipart middleware on backend
    // return instance.put('user/update', objToFormData(data))
    return authorizedInstance.put<UserModels.UserResponse>('user/me', data)
  },
}

export const tracking = {
  view(
    data: { videoUrl: string, videoId: string, platformId: string, platformType: string },
  ) {
    return authorizedInstance.post('tracking/view', data)
  },

}

export const txs = {
  send(
    data: {
      signedTransfer: string,
      toUserId: string,
      value: string,
      expiration: string,
      nonce: string,
      message?: string,
      recipientPlatformType?: PlatformModels.PlatformTypes,
      recipientPlatformId?: string,
    },
  ) {
    return authorizedInstance.post('txs/send', data)
  },

  getPromoStatus() {
    return authorizedInstance.get<boolean>('txs/promo')
  },

  redeemPromo() {
    return authorizedInstance.post<boolean>('txs/promo', null)
  },

  getTx(txHash: string) {
    return authorizedInstance.get<TxModels.TxResponse>(`txs/txHash/${txHash}`)
  },

  getAllTxs() {
    return authorizedInstance.get<TxModels.TxResponse[]>(`txs`)
  },

  claimEscrow(txHash: string) {
    return authorizedInstance.post<boolean>(`txs/claimEscrow/${txHash}`, null)
  },
}

async function getOauthRedirectUrl(url: string): Promise<Url> {
  const redirectUrl = await (new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow({ url, interactive: true }, (uri) => resolve(uri))
  })) as string

  return parse(redirectUrl, true)
}

export const platform = {
  async getPlatforms() {
    return await authorizedInstance.get<PlatformModels.PlatformsResponse>('/platforms/')
  },

  async getTwitchUser() {
    const twitchUrl = format({
      protocol: 'https',
      host: 'api.twitch.tv/kraken/oauth2/authorize',
      query: {
        response_type: 'code',
        client_id: TWITCH_CLIENT_ID,
        redirect_uri: `https://${chrome.runtime.id}.chromiumapp.org/twitch_cb`,
        scope: 'openid user_read',
      },
    })

    const urlObj = await getOauthRedirectUrl(twitchUrl)

    if (urlObj.hash && urlObj.hash.startsWith('#error')) {
      throw new Error(Errors.PlatformErrors.OAUTH)
    }

    return await authorizedInstance.post<PlatformModels.PlatformsResponse>(
      '/platforms/twitch', { code: urlObj.query.code })
  },

  // https://stackoverflow.com/questions/31141573/chrome-identity-getauthtoken-not-working
  // https://gist.github.com/raineorshine/970b60902c9e6e04f71d
  async getYoutubeChannels() {
    const youtubeUrl = format({
      protocol: 'https',
      host: 'accounts.google.com/o/oauth2/v2/auth',
      query: {
        response_type: 'code',
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: `https://${chrome.runtime.id}.chromiumapp.org/youtube_cb`,
        scope: ['https://www.googleapis.com/auth/youtube.readonly'],
      },
    })
    const urlObj = await getOauthRedirectUrl(youtubeUrl)

    if (urlObj.query.error) {
      throw new Error(Errors.PlatformErrors.OAUTH)
    }

    return await authorizedInstance.post<PlatformModels.PlatformsResponse>(
      '/platforms/youtube', { code: urlObj.query.code })
  },

  async deletePlatform(platformId: string) {
    // Axios doesn'support response body on delete()
    return await authorizedInstance.delete(`/platforms/${platformId}`)
  },
}

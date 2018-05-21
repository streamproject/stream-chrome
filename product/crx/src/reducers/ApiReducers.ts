import { Reducer } from 'redux'
import {
  AuthModels,
  Errors,
  PlatformModels,
  UserModels,
} from 'shared/dist/models'
import {
  Actions as AuthApiActions, AUTH_ERROR_RESPONSE, AUTH_RESET,
  FromInjectionMessages as FromAuthInjectionActions, LOGIN_RESPONSE,
  LOGIN_START, LOGOUT_RESPONSE, LOGOUT_START, SIGNUP_RESPONSE, SIGNUP_START,
} from '../actions/AuthApiActions'
import { Actions as PlatformApiActions, PLATFORMS_RESPONSE } from '../actions/PlatformApiActions'
import {
  Actions as UserApiActions, UPDATE_USER_RESPONSE, UPDATE_USER_START,
  USER_ERROR_RESPONSE, USER_RESET,
} from '../actions/UserApiActions'
import { ACCESS_TOKEN, removeToken, RFERESH_TOKEN } from '../utils/AuthTokenUtils'

// TODO: Refactor into separate reducers for each API
export type State = AuthModels.AuthResponse
  & UserModels.UserResponse
  & {
    platforms: PlatformModels.PlatformsResponse,
    error: Errors.ERRORS_TYPE,
    loading: boolean,
  }

export const authTokenErrors = new Set([
  Errors.AuthErrors.TOKEN_MISSING, Errors.AuthErrors.TOKEN_EXPIRED, Errors.AuthErrors.TOKEN_ERROR])

export const initialState: State = {
  id: '',
  email: '',
  username: '',
  profPic: '',
  phone: '',
  address: '',
  referral_code: '',
  referrer_id: '',
  platforms: [],
  error: null,
  loading: false,
  accessToken: '',
  refreshToken: '',
}

export function setIconToGreyscale(greyscale: boolean) {
  if (greyscale) {
    chrome.browserAction.setIcon({
      path: {
        16: 'icons/StreamGrey16.png',
        24: 'icons/StreamGrey24.png',
        32: 'icons/StreamGrey32.png',
        48: 'icons/StreamGrey48.png',
        128: 'icons/StreamGrey128.png',
      },
    })
  } else {
    chrome.browserAction.setIcon({
      path: {
        16: 'icons/clear16.png',
        24: 'icons/clear24.png',
        32: 'icons/clear32.png',
        48: 'icons/clear48.png',
        128: 'icons/clear128.png',
      },
    })
  }
}

export const reducer: Reducer<State> = (
  state = initialState,
  action: AuthApiActions[keyof AuthApiActions]
    | FromAuthInjectionActions[keyof FromAuthInjectionActions]
    | UserApiActions[keyof UserApiActions]
    | PlatformApiActions[keyof PlatformApiActions],
) => {
  switch (action.type) {
    case LOGIN_START:
    case SIGNUP_START:
    case UPDATE_USER_START:
      return { ...state, error: null, loading: true }

    case SIGNUP_RESPONSE:
    case LOGIN_RESPONSE:
      setIconToGreyscale(false)
      return { ...state, error: null, ...action.response, loading: false }

    case UPDATE_USER_RESPONSE:
      return { ...state, error: null, ...action.response, loading: false }

    case PLATFORMS_RESPONSE:
      return { ...state, error: null, platforms: action.platforms, loading: false }

    case AUTH_ERROR_RESPONSE:
    case USER_ERROR_RESPONSE:
      // if error is a auth token error, log the user out.
      if (!authTokenErrors.has(action.error)) {
        return { ...state, error: action.error, loading: false }
      }
    case LOGOUT_START:
    case LOGOUT_RESPONSE:
    case USER_RESET:
    case AUTH_RESET:
      setIconToGreyscale(true)
      // NOTE: Also see ApiUtils to see where tokens are set.
      removeToken(RFERESH_TOKEN)
      removeToken(ACCESS_TOKEN)
      return { ...initialState, error: null, loading: false }

    default:
      return state
  }
}

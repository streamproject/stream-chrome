import { push } from 'react-router-redux'
import { Dispatch } from 'redux'
import { EventTypes } from 'redux-segment'
import { ThunkAction } from 'redux-thunk'
import { AuthModels, UserModels } from 'shared/dist/models'
import * as Errors from 'shared/dist/models/Errors/AuthErrors'
import * as Routes from '../constants/routes'
import { RootState } from '../reducers/RootReducer'
import { auth as authApi } from '../utils/ApiUtils'
import { Meta } from '../utils/SegmentUtils'
import { actionCreators as platformApiActionCreators } from './PlatformApiActions'
import { actionCreators as strTokenActionCreators } from './StrTokenActions'
import { actionCreators as viewsActionCreators } from './ViewsActions'

export const LOGIN_START = 'LOGIN_START'
export const LOGIN_RESPONSE = 'LOGIN_RESPONSE'

export const LOGOUT_START = 'LOGOUT_START'
export const LOGOUT_RESPONSE = 'LOGOUT_RESPONSE'

export const CHECK_SIGNUP_START = 'CHECK_SIGNUP_START'
export const SIGNUP_START = 'SIGNUP_START'
export const SIGNUP_RESPONSE = 'SIGNUP_RESPONSE'

export const AUTH_RESET = 'AUTH_RESET'

export const AUTH_ERROR_RESPONSE = 'AUTH_ERROR_RESPONSE'

export const GET_AUTH_REDUX_STATE = 'GET_AUTH_REDUX_STATE'
export const GET_AUTH_REDUX_STATE_RESPONSE = 'GET_AUTH_REDUX_STATE_RESPONSE'

export type Actions = {
  LOGIN_START: {
    type: typeof LOGIN_START,
    username: string,
    password: string,
  },

  LOGIN_RESPONSE: {
    type: typeof LOGIN_RESPONSE,
    response: AuthModels.AuthResponse,
    meta: Meta,
  },

  LOGOUT_START: {
    type: typeof LOGOUT_START,
  },

  LOGOUT_RESPONSE: {
    type: typeof LOGOUT_RESPONSE,
    response: AuthModels.AuthResponse,
    meta: Meta,
  },

  CHECK_SIGNUP_START: {
    type: typeof CHECK_SIGNUP_START,
    username: string,
    email: string,
    password: string,
    referrerCode?: string,
  },

  SIGNUP_START: {
    type: typeof SIGNUP_START,
    username: string,
    email: string,
    password: string,
    referrerCode?: string,
  },

  SIGNUP_RESPONSE: {
    type: typeof SIGNUP_RESPONSE,
    response: AuthModels.AuthResponse,
    meta: Meta,
  },

  AUTH_RESET: {
    type: typeof AUTH_RESET,
  },

  AUTH_ERROR_RESPONSE: {
    type: typeof AUTH_ERROR_RESPONSE,
    error: Errors.ERRORS_TYPE,
    meta: Meta,
  },
}

export const actionCreators = {
  // AuthController
  login(
    data: {username: string, password: string},
  ): Actions[typeof LOGIN_START] {
    return {
      type: LOGIN_START,
      ...data,
    }
  },

  logout(): Actions[typeof LOGOUT_START] {
    return {
      type: LOGOUT_START,
    }
  },

  checkSignup(
    user: { username: string, email: string, password: string, referrerCode?: string },
  ): Actions[typeof CHECK_SIGNUP_START] {
    return {
      type: CHECK_SIGNUP_START,
      ...user,
    }
  },

  signup(
    user: { username: string, email: string, password: string, referrerCode?: string },
  ): Actions[typeof SIGNUP_START] {
    return {
      type: SIGNUP_START,
      ...user,
    }
  },

  reset(): Actions[typeof AUTH_RESET] {
    return { type: AUTH_RESET }
  },

  setAuthError(error: Errors.ERRORS_TYPE): Actions[typeof AUTH_ERROR_RESPONSE] {
    return {
      type: AUTH_ERROR_RESPONSE,
      error,
      meta: error === null ? undefined : {
        analytics: {
          eventType: EventTypes.track,
          eventPayload: {
            event: AUTH_ERROR_RESPONSE,
            properties: {
              error,
            },
          },
        },
      },
    }
  },
}

export const asyncActionCreators = {

  login(
    data: Actions[typeof LOGIN_START],
  ): ThunkAction<void, RootState, void> {
    return async (dispatch: Dispatch<RootState>, getState: () => RootState) => {
      try {
        const { username, password } = data
        const response = await authApi.login({ username, password })

        const action: Actions[typeof LOGIN_RESPONSE] = {
          type: LOGIN_RESPONSE,
          response: response.data,
          meta: {
            analytics: [
              {
                eventType: EventTypes.identify,
                eventPayload: {
                  userId: response.data.id,
                },
              },
              {
                eventType: EventTypes.track,
                eventPayload: {
                  event: LOGIN_RESPONSE,
                  properties: {
                    username: data.username,
                  },
                },
              },
            ],
          },
        }

        dispatch(action)

        // TODO: This should be enforced more strongly.
        dispatch(platformApiActionCreators.getPlatforms())
        dispatch(strTokenActionCreators.getPromoStatus())
        dispatch(viewsActionCreators.reset())
        dispatch(strTokenActionCreators.getAllTxsData())

        if (response.data.phone) {
          dispatch(push(Routes.WALLET))
        } else {
          dispatch(push(Routes.PHONE))
        }

      } catch (error) {
        dispatch(actionCreators.setAuthError(error))
        return
      }
    }
  },

  logout(): ThunkAction<void, RootState, void> {
    return async (dispatch: Dispatch<RootState>, getState: () => RootState) => {
      try {
        const response = await authApi.logout()
        const action: Actions[typeof LOGOUT_RESPONSE] = {
          type: LOGOUT_RESPONSE,
          response: response.data,
          meta: {
            analytics: {
              eventType: EventTypes.track,
              eventPayload: {
                event: LOGOUT_RESPONSE,
                properties: {},
              },
            },
          },
        }
        dispatch(action)
      } catch (error) {
        dispatch(actionCreators.setAuthError(error))
      }

      dispatch(actionCreators.reset())
      dispatch(viewsActionCreators.reset())
      dispatch(push(Routes.ROOT))
    }
  },

  checkSignup(
    data: Actions[typeof CHECK_SIGNUP_START],
  ): ThunkAction<void, RootState, void> {
    return async (dispatch: Dispatch<RootState>, getState: () => RootState) => {
      try {
        const { username, email, password, referrerCode } = data
        await authApi.checkSignup({ username, email, password, referrerCode })
      } catch (error) {
        dispatch(actionCreators.setAuthError(error))
        return
      }
    }
  },

  signup(
    data: Actions[typeof SIGNUP_START],
  ): ThunkAction<void, RootState, void> {
    return async (dispatch: Dispatch<RootState>, getState: () => RootState) => {
      try {
        const { username, email, password, referrerCode } = data
        const response = await authApi.signup({ username, email, password, referrerCode })

        const action: Actions[typeof SIGNUP_RESPONSE] = {
          type: SIGNUP_RESPONSE,
          response: response.data,
          meta: {
            analytics: [
              {
                eventType: EventTypes.identify,
                eventPayload: {
                  userId: response.data.id,
                },
              },
            ],
          },
        }

        dispatch(action)
        dispatch(viewsActionCreators.reset())
        dispatch(strTokenActionCreators.getPromoStatus())
        dispatch(strTokenActionCreators.getAllTxsData())
        dispatch(push(Routes.PHONE))
      } catch (error) {
        dispatch(actionCreators.setAuthError(error))
        return
      }
    }
  },
}

export const aliases = {
  [LOGIN_START](data: Actions[typeof LOGIN_START]) { return asyncActionCreators.login(data) },

  [LOGOUT_START](data: Actions[typeof LOGOUT_START]) { return asyncActionCreators.logout() },

  [CHECK_SIGNUP_START](data: Actions[typeof CHECK_SIGNUP_START]) { return asyncActionCreators.checkSignup(data) },

  [SIGNUP_START](data: Actions[typeof SIGNUP_START]) { return asyncActionCreators.signup(data) },
}

export type FromInjectionMessages = {
  GET_AUTH_REDUX_STATE: {
    type: typeof GET_AUTH_REDUX_STATE,
  },
}

export type FromBackgroundMessages = {
  GET_AUTH_REDUX_STATE_RESPONSE: {
    type: typeof GET_AUTH_REDUX_STATE_RESPONSE,
    currentUser: UserModels.UserResponse,
  },
}

export const fromInjectionMessageCreators = {
  getAuthReduxState(): FromInjectionMessages[typeof GET_AUTH_REDUX_STATE] {
    return {
      type: GET_AUTH_REDUX_STATE,
    }
  },
}

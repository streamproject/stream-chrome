import { push } from 'react-router-redux'
import { Dispatch } from 'redux'
import { EventTypes } from 'redux-segment'
import { ThunkAction } from 'redux-thunk'
import { Errors, UserModels } from 'shared/dist/models'
import * as Routes from '../constants/routes'
import { RootState } from '../reducers/RootReducer'
import { objectUrlToFile, user as userApi } from '../utils/ApiUtils'
import { Meta } from '../utils/SegmentUtils'
import { actionCreators as strTokenActionCreators } from './StrTokenActions'
import { actionCreators as viewsActionCreators } from './ViewsActions'

export const UPDATE_USER_START = 'UPDATE_USER_START'
export const UPDATE_USER_RESPONSE = 'UPDATE_USER_RESPONSE'

export const VERIFY_START = 'VERIFY_START'
export const VERIFY_RESPONSE = 'VERIFY_RESPONSE'

export const CHECK_START = 'CHECK_START'
export const CHECK_RESPONSE = 'CHECK_RESPONSE'

export const USER_RESET = 'USER_RESET'

export const USER_ERROR_RESPONSE = 'USER_ERROR_RESPONSE'

export const GET_VIDEO_OWNER = 'GET_VIDEO_OWNER'
export const GET_VIDEO_OWNER_RESPONSE = 'GET_VIDEO_OWNER_RESPONSE'

export type Actions = {
  UPDATE_USER_START: {
    type: typeof UPDATE_USER_START,
    password?: string,
    newPassword?: string,
    profilePhotoObjectUrl?: string,
    address?: string,
    email?: string,
    nextRoute?: Routes.Routes,
  },
  UPDATE_USER_RESPONSE: { type: typeof UPDATE_USER_RESPONSE, response: UserModels.UserResponse, meta: Meta },

  VERIFY_START: { type: typeof VERIFY_START, nationalNumber: string, countryCode: string },
  VERIFY_RESPONSE: { type: typeof VERIFY_RESPONSE, verifyResponse: UserModels.AuthyVerifyResponse, meta: Meta },

  CHECK_START: { type: typeof CHECK_START, verificationCode: string, nationalNumber: string, countryCode: string },
  CHECK_RESPONSE: { type: typeof CHECK_RESPONSE, checkResponse: UserModels.AuthyCheckResponse, meta: Meta },

  USER_RESET: { type: typeof USER_RESET },

  USER_ERROR_RESPONSE: { type: typeof USER_ERROR_RESPONSE, error: Errors.ERRORS_TYPE, meta: Meta },
}

export const actionCreators = {
  // UserController
  updateUser(
    userUpdate: {
      password?: string,
      newPassword?: string,
      profilePhotoObjectUrl?: string,
      address?: string,
      email?: string,
      nextRoute?: Routes.Routes,
    },
    nextRoute?: Routes.Routes,
  ): Actions[typeof UPDATE_USER_START] {
    return { type: UPDATE_USER_START, ...userUpdate, nextRoute }
  },

  verifyPhone(
    data: {nationalNumber: string, countryCode: string},
  ): Actions[typeof VERIFY_START] {
    return { type: VERIFY_START, ...data }
  },

  checkPhone(
    data: { verificationCode: string, nationalNumber: string, countryCode: string },
  ): Actions[typeof CHECK_START] {
    return { type: CHECK_START, ...data }
  },

  setUserError(error: Errors.ERRORS_TYPE): Actions[typeof USER_ERROR_RESPONSE] {
    return {
      type: USER_ERROR_RESPONSE,
      error,
      meta: error === null ? undefined : {
        analytics: {
          eventType: EventTypes.track,
          eventPayload: {
            event: USER_ERROR_RESPONSE,
            properties: {
              error,
            },
          },
        },
      },
    }
  },

  reset(): Actions[typeof USER_RESET] {
    return { type: USER_RESET }
  },
}

export const asyncActionCreators = {

  updateUser(
    userUpdate: {
      password?: string,
      newPassword?: string,
      profilePhotoObjectUrl?: string,
      address?: string,
      email?: string,
      nextRoute?: Routes.Routes,
    },
  ): ThunkAction<void, RootState, void> {
    return async (dispatch: Dispatch<RootState>, getState: () => RootState) => {
      try {
        const { password, newPassword, profilePhotoObjectUrl, address, email, nextRoute } = userUpdate

        const { promoRedeemed } = getState().str

        const profPic = profilePhotoObjectUrl ? await objectUrlToFile(profilePhotoObjectUrl) : null
        const response = await userApi.update({ password, newPassword, profPic, address, email })

        const action: Actions[typeof UPDATE_USER_RESPONSE] = {
          type: UPDATE_USER_RESPONSE,
          response: response.data,
          meta: {
            analytics: {
              eventType: EventTypes.track,
              eventPayload: {
                event: UPDATE_USER_RESPONSE,
                properties: { },
              },
            },
          },
        }

        dispatch(action)
        dispatch(viewsActionCreators.reset())

        if (!promoRedeemed) {
          dispatch(strTokenActionCreators.redeemPromo())
        }

        if (nextRoute) {
          dispatch(push(nextRoute))
        }
      } catch (error) {
        dispatch(actionCreators.setUserError(error))
        return
      }

    }
  },

  verifyPhone(
    data: { nationalNumber: string, countryCode: string },
  ): ThunkAction<void, RootState, void> {
    return async (dispatch: Dispatch<RootState>, getState: () => RootState) => {
      try {
        const { nationalNumber, countryCode } = data
        const response = await userApi.verify({ nationalNumber, countryCode })

        const action: Actions[typeof VERIFY_RESPONSE] = {
          type: VERIFY_RESPONSE,
          verifyResponse: response.data,
          meta: {
            analytics: {
              eventType: EventTypes.track,
              eventPayload: {
                event: VERIFY_RESPONSE,
                properties: { },
              },
            },
          },
        }

        dispatch(action)

        if (response.data.success) {
          dispatch(push(Routes.CHECK_PHONE))
        }
      } catch (error) {
        dispatch(actionCreators.setUserError(error))
        return
      }
    }
  },

  checkPhone(
    data: { verificationCode: string, nationalNumber: string, countryCode: string },
  ): ThunkAction<void, RootState, void> {
    return async (dispatch: Dispatch<RootState>, getState: () => RootState) => {
      try {
        const { verificationCode, nationalNumber, countryCode } = data
        const response = await userApi.check({ verificationCode, nationalNumber, countryCode })

        const action: Actions[typeof CHECK_RESPONSE] = {
          type: CHECK_RESPONSE,
          checkResponse: response.data,
          meta: {
            analytics: {
              eventType: EventTypes.track,
              eventPayload: {
                event: CHECK_RESPONSE,
                properties: { },
              },
            },
          },
        }

        dispatch(action)
        dispatch(viewsActionCreators.reset())

        if (response.data.success) {
          dispatch(push(Routes.WELCOME))
        }
      } catch (error) {
        dispatch(actionCreators.setUserError(error))
        return
      }

    }
  },

}

export const aliases = {
  [UPDATE_USER_START](data: Actions[typeof UPDATE_USER_START]) { return asyncActionCreators.updateUser(data) },

  [VERIFY_START](data: Actions[typeof VERIFY_START]) { return asyncActionCreators.verifyPhone(data) },

  [CHECK_START](data: Actions[typeof CHECK_START]) { return asyncActionCreators.checkPhone(data) },
}

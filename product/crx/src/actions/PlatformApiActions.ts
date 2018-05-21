import * as _ from 'lodash'
import { Dispatch } from 'redux'
import { EventTypes } from 'redux-segment'
import { ThunkAction } from 'redux-thunk'
import { PlatformModels } from 'shared/dist/models'
import { RootState } from '../reducers/RootReducer'
import * as ApiUtils from '../utils/ApiUtils'
import { Meta } from '../utils/SegmentUtils'

export const GET_PLATFORMS = 'GET_PLATFORMS'
export const PLATFORMS_RESPONSE = 'PLATFORMS_RESPONSE'
export const CONNECT_PLATFORM = 'CONNECT_PLATFORM'
export const DELETE_PLATFORM = 'DELETE_PLATFORM'

// TODO: Refactor analytics here. See AuthApiActions for a better example.
export type Actions = {
  GET_PLATFORMS: {
    type: typeof GET_PLATFORMS,
    meta?: Meta,
  },

  PLATFORMS_RESPONSE: {
    type: typeof PLATFORMS_RESPONSE,
    platforms: PlatformModels.PlatformsResponse,
    meta: Meta,
  }

  CONNECT_PLATFORM: {
    type: typeof CONNECT_PLATFORM,
    platform: PlatformModels.PlatformTypes,
    meta: Meta,
  },

  DELETE_PLATFORM: {
    type: typeof DELETE_PLATFORM,
    platformType: PlatformModels.PlatformTypes,
    meta: Meta,
  },
}

export const actionCreators = {
  getPlatforms(meta?: Meta) {
    return {
      type: GET_PLATFORMS,
      meta,
    }
  },

  connectPlatform(platform: PlatformModels.PlatformTypes): Actions[typeof CONNECT_PLATFORM] {
    return {
      type: CONNECT_PLATFORM,
      platform,
      meta: {
        analytics: {
          eventType: EventTypes.track,
          eventPayload: {
            event: CONNECT_PLATFORM,
            properties: {
              platform,
            },
          },
        },
      },
    }
  },

  deletePlatform(platformType: PlatformModels.PlatformTypes): Actions[typeof DELETE_PLATFORM] {
    return {
      type: DELETE_PLATFORM,
      platformType,
      meta: {
        analytics: {
          eventType: EventTypes.track,
          eventPayload: {
            event: DELETE_PLATFORM,
            properties: {
              platformType,
            },
          },
        },
      },
    }
  },
}

export const asyncActionCreators = {

  getPlatforms(
    action: Actions[typeof GET_PLATFORMS],
  ): ThunkAction<void, RootState, void> {
    return async (dispatch: Dispatch<RootState>, getState: () => RootState) => {
      const response = await ApiUtils.platform.getPlatforms()
      const nextAction: Actions[typeof PLATFORMS_RESPONSE] = {
        type: PLATFORMS_RESPONSE,
        platforms: response.data,
        meta: action.meta,
      }

      dispatch(nextAction)
    }
  },

  connectPlatform(
    action: Actions[typeof CONNECT_PLATFORM],
  ): ThunkAction<void, RootState, void> {
    return async (dispatch: Dispatch<RootState>, getState: () => RootState) => {
      let response = null

      switch (action.platform) {
        case PlatformModels.TWITCH:
          response = await ApiUtils.platform.getTwitchUser()
          break
        case PlatformModels.YOUTUBE:
          response = await ApiUtils.platform.getYoutubeChannels()
          break
      }

      const nextAction: Actions[typeof PLATFORMS_RESPONSE] = {
        type: PLATFORMS_RESPONSE,
        platforms: response.data,
        meta: action.meta,
      }

      dispatch(nextAction)
    }
  },

  // Axios doesn't seem to support a response body when using DELETE, so we
  // can't use PLATFORMS_RESPONSE like in previous actions.
  deletePlatform(
    action: Actions[typeof DELETE_PLATFORM],
  ): ThunkAction<void, RootState, void> {
    return async (dispatch: Dispatch<RootState>, getState: () => RootState) => {
      const { platforms } = getState().api
      const platformsToDelete = _(platforms).chain()
        .filter((platform) => platform.platformType === action.platformType)
        .map((platform) => ApiUtils.platform.deletePlatform(platform.id))
        .value()

      await Promise.all(platformsToDelete)

      dispatch(actionCreators.getPlatforms())
    }
  },
}

export const aliases = {
  [GET_PLATFORMS](action: Actions[typeof GET_PLATFORMS]) {
    return asyncActionCreators.getPlatforms(action)
  },

  [CONNECT_PLATFORM](action: Actions[typeof CONNECT_PLATFORM]) {
    return asyncActionCreators.connectPlatform(action)
  },

  [DELETE_PLATFORM](action: Actions[typeof DELETE_PLATFORM]) {
    return asyncActionCreators.deletePlatform(action)
  },
}

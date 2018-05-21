import { Reducer } from 'redux'
import { UserModels } from 'shared/dist/models'
import * as AuthApiActions from '../actions/AuthApiActions'
import { FromBackgroundMessages } from '../actions/RootActions'
import * as StrTokenActions from '../actions/StrTokenActions'
import * as TwitchActions from '../actions/TwitchActions'
import * as YoutubeActions from '../actions/YoutubeActions'
import { TwitchResponse } from '../utils/TwitchUtils'
import { YoutubeResponse } from '../utils/YoutubeUtils'

export type State = {
  currentUser: UserModels.UserResponse,
  platformUser: UserModels.UserResponse,
  signedTransferResponse: any,
  youtubeVideoInfo: YoutubeResponse,
  twitchChannelInfo: TwitchResponse,
}

export const initialState: State = {
  currentUser: null,
  platformUser: null,
  youtubeVideoInfo: null,
  twitchChannelInfo: null,
  signedTransferResponse: null,
}

export const reducer: Reducer<State> = (
  state = initialState,
  message: FromBackgroundMessages,
) => {
  switch (message.type) {
    case YoutubeActions.GET_YOUTUBE_INFO_RESPONSE:
      return {
        ...state,
        youtubeVideoInfo: message.videoInfo,
        platformUser: message.platformUser,
      }

    case TwitchActions.GET_TWITCH_INFO_RESPONSE:
      return {
        ...state,
        twitchChannelInfo: message.channelInfo,
        platformUser: message.platformUser,
      }

    case StrTokenActions.SEND_RESPONSE:
      return {
        ...state,
        signedTransferResponse: message.signedTransferResponse,
      }

    case AuthApiActions.GET_AUTH_REDUX_STATE_RESPONSE:
      return {
        ...state,
        currentUser: message.currentUser,
      }

    default:
      return state
    }
}

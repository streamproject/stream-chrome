import { UserModels } from 'shared/dist/models'
import { TwitchResponse } from '../utils/TwitchUtils'

export const GET_TWITCH_INFO = 'GET_TWITCH_INFO'
export const GET_TWITCH_INFO_RESPONSE = 'GET_TWITCH_INFO_RESPONSE'

export type FromInjectionMessages = {
  GET_TWITCH_INFO: {
    type: typeof GET_TWITCH_INFO,
  },
}

export type FromBackgroundMessages = {
  GET_TWITCH_INFO_RESPONSE: {
    type: typeof GET_TWITCH_INFO_RESPONSE,
    login: string,
    channelInfo: TwitchResponse,
    platformUser: UserModels.UserResponse,
  },
}

export const fromInjectionMessageCreators = {
  getTwitchInfo(): FromInjectionMessages[typeof GET_TWITCH_INFO] {
    return {
      type: GET_TWITCH_INFO,
    }
  },
}

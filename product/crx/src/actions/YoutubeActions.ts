import { UserModels } from 'shared/dist/models'
import { YoutubeResponse } from '../utils/YoutubeUtils'

export const GET_YOUTUBE_INFO = 'GET_YOUTUBE_INFO'
export const GET_YOUTUBE_INFO_RESPONSE = 'GET_YOUTUBE_INFO_RESPONSE'

export type FromInjectionMessages = {
  GET_YOUTUBE_INFO: {
    type: typeof GET_YOUTUBE_INFO,
  },
}

export type FromBackgroundMessages = {
  GET_YOUTUBE_INFO_RESPONSE: {
    type: typeof GET_YOUTUBE_INFO_RESPONSE,
    videoId: string,
    videoInfo: YoutubeResponse,
    platformUser: UserModels.UserResponse,
  },
}

export const fromInjectionMessageCreators = {
  getYoutubeInfo(): FromInjectionMessages[typeof GET_YOUTUBE_INFO] {
    return {
      type: GET_YOUTUBE_INFO,
    }
  },
}

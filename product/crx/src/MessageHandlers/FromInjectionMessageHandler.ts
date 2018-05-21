import * as LRU from 'lru-cache'
import { Store } from 'redux'
import { PlatformModels } from 'shared/dist/models'
import { TxErrors } from 'shared/dist/models/Errors'
import * as Errors from 'shared/dist/models/Errors/CrxErrors'
import * as AuthApiActions from '../actions/AuthApiActions'
import { FromInjectionMessages } from '../actions/RootActions'
import * as StrTokenActions from '../actions/StrTokenActions'
import * as TrackingActions from '../actions/TrackingActions'
import * as TwitchActions from '../actions/TwitchActions'
import * as YoutubeActions from '../actions/YoutubeActions'
import { LRU_CACHE_MAX, LRU_CACHE_MAX_AGE } from '../constants/config'
import { RootState } from '../reducers/RootReducer'
import * as ApiUtils from '../utils/ApiUtils'
import * as TwitchUtils from '../utils/TwitchUtils'
import * as YoutubeUtils from '../utils/YoutubeUtils'

const YoutubeCache = new LRU<string, YoutubeUtils.YoutubeResponse>({
  max: LRU_CACHE_MAX,
  maxAge: LRU_CACHE_MAX_AGE,
})

const TwitchCache = new LRU<string, TwitchUtils.TwitchResponse>({
  max: LRU_CACHE_MAX,
  maxAge: LRU_CACHE_MAX_AGE,
})

// Architectually, this is a bit weird. It breaks the idiom of making API
// Requests in the async actions. But this also isn't redux, it's just message
// passing..
export async function getYoutubeInfo(tab: chrome.tabs.Tab, state: RootState) {
  const videoId = YoutubeUtils.getYoutubeVideoId(tab.url)
  let videoInfo = YoutubeCache.get(videoId)

  if (!videoInfo) {
    const response = await YoutubeUtils.getYoutubeVideoInfo(videoId)
    videoInfo = response.data
  }

  let platformUser = null

  try {
    const channelId = videoInfo.items[0].snippet.channelId

    const response = await ApiUtils.user.getFromPlatform(channelId, PlatformModels.YOUTUBE)

    platformUser = response.data
  } catch (e) {
    throw e
  }

  const youtubeInfoResponse:
    YoutubeActions.FromBackgroundMessages[typeof YoutubeActions.GET_YOUTUBE_INFO_RESPONSE] = {
    type: YoutubeActions.GET_YOUTUBE_INFO_RESPONSE,
    videoId,
    videoInfo,
    platformUser,
  }

  return youtubeInfoResponse
}

export async function getTwitchInfo(tab: chrome.tabs.Tab, state: RootState) {
  const login = TwitchUtils.getTwitchUsername(tab.url)
  let channelInfo = TwitchCache.get(login)

  if (!channelInfo) {
    const response = await TwitchUtils.getTwitchUser(login)
    channelInfo = response.data
  }

  let platformUser = null

  try {
    const channelId = channelInfo.data[0].id

    const response = await ApiUtils.user.getFromPlatform(channelId, PlatformModels.TWITCH)

    platformUser = response.data
  } catch (e) {
    throw e
  }

  const twitchInfoResponse:
    TwitchActions.FromBackgroundMessages[typeof TwitchActions.GET_TWITCH_INFO_RESPONSE] = {
    type: TwitchActions.GET_TWITCH_INFO_RESPONSE,
    login,
    channelInfo,
    platformUser,
  }

  return twitchInfoResponse
}

export const FromInjectionMessageHandler = (

  store: Store<RootState>,
  message: FromInjectionMessages,
  port: chrome.runtime.Port,
) => {
  switch (message.type) {
    case AuthApiActions.GET_AUTH_REDUX_STATE:
      const authReduxStateResponse:
        AuthApiActions.FromBackgroundMessages[typeof AuthApiActions.GET_AUTH_REDUX_STATE_RESPONSE] = {
        type: AuthApiActions.GET_AUTH_REDUX_STATE_RESPONSE,
        currentUser: {
          id: store.getState().api.id,
          username: store.getState().api.username,
          address: store.getState().api.address,
          email: '',
          phone: '',
          profPic: '',
          referral_code: '',
          referrer_id: '',
        },
      }
      port.postMessage(authReduxStateResponse)
      return

    case YoutubeActions.GET_YOUTUBE_INFO:
      chrome.tabs.get(port.sender.tab.id, async (tab) => {
        const youtubeInfoResponse = await getYoutubeInfo(tab, store.getState())

        YoutubeCache.set(youtubeInfoResponse.videoId, youtubeInfoResponse.videoInfo)
        port.postMessage(youtubeInfoResponse)
      })
      return

    case TwitchActions.GET_TWITCH_INFO:
      chrome.tabs.get(port.sender.tab.id, async (tab) => {
        const twitchInfoResponse = await getTwitchInfo(tab, store.getState())

        TwitchCache.set(twitchInfoResponse.login, twitchInfoResponse.channelInfo)
        port.postMessage(twitchInfoResponse)
      })
      return

    // A cleaner way to do this might be to derive the platform type from url
    // instead of metadata in the message
    case TrackingActions.ADD_NEW_VIEW:
      chrome.tabs.get(port.sender.tab.id, async (tab) => {
        if (!tab.active) {
          return
        }

        if (YoutubeUtils.isYoutubeVideoUrl(tab.url)) {
          const videoId = YoutubeUtils.getYoutubeVideoId(tab.url)
          const videoInfo = YoutubeCache.get(videoId)

          // This can cause a race condition if the cache isn't populated before the view is tracked
          if (!videoInfo) {
            throw new Error(Errors.PLATFORM_INFO_CACHE_MISSING)
          }

          ApiUtils.tracking.view(
            {
              videoUrl: tab.url,
              videoId,
              platformId: videoInfo.items[0].snippet.channelId,
              platformType: PlatformModels.YOUTUBE,
            },
          )
        } else if (TwitchUtils.isTwitchChannelUrl(tab.url)) {
          const twitchUsername = TwitchUtils.getTwitchUsername(tab.url)
          const channelInfo = TwitchCache.get(twitchUsername)

          if (!channelInfo) {
            throw new Error(Errors.PLATFORM_INFO_CACHE_MISSING)
          }

          ApiUtils.tracking.view(
            {
              videoUrl: tab.url,
              videoId: channelInfo.data[0].id,
              platformId: channelInfo.data[0].id,
              platformType: PlatformModels.TWITCH,
            },
          )
        }
      })
      return

    case StrTokenActions.SEND:
      chrome.tabs.get(port.sender.tab.id, async (tab) => {
        if (!tab.active) {
          return
        }

        let recipientPlatformType: PlatformModels.PlatformTypes
        let recipientPlatformId: string

        if (YoutubeUtils.isYoutubeVideoUrl(tab.url)) {
          const youtubeInfoResponse = await getYoutubeInfo(tab, store.getState())
          if (youtubeInfoResponse.platformUser.id !== message.toUserId) {
            throw new Error(TxErrors.TRANSFER_FAILED)
          }

          recipientPlatformType = PlatformModels.YOUTUBE
          recipientPlatformId = youtubeInfoResponse.videoInfo.items[0].snippet.channelId

        } else if (TwitchUtils.isTwitchChannelUrl(tab.url)) {
          const twitchInfoResponse = await getTwitchInfo(tab, store.getState())

          if (twitchInfoResponse.platformUser.id !== message.toUserId) {
            throw new Error(TxErrors.TRANSFER_FAILED)
          }

          recipientPlatformType = PlatformModels.TWITCH
          recipientPlatformId = twitchInfoResponse.channelInfo.data[0].id
        } else {
          throw new Error(TxErrors.TRANSFER_FAILED)
        }

        const { type, ...signedTransferData } = message as StrTokenActions.FromInjectionMessages[
          typeof StrTokenActions.SEND]

        const data = {
          ...signedTransferData,
          recipientPlatformType: recipientPlatformType as PlatformModels.PlatformTypes,
          recipientPlatformId,
        }

        ApiUtils.txs.send(data)
          .then((result) => {
            const response:
            StrTokenActions.FromBackgroundMessages[typeof StrTokenActions.SEND_RESPONSE] = {
              type: StrTokenActions.SEND_RESPONSE,
              signedTransferResponse: result.data,
            }

            port.postMessage(response)
          })
      })
      return

    case StrTokenActions.UPDATE_WEB3_EXISTS:
    case StrTokenActions.UPDATE_WALLET:
    case StrTokenActions.UPDATE_TX_EVENTS:
      store.dispatch(message)
      return

    default:
      return
  }
}

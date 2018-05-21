import { Store } from 'redux'
import * as AuthApiActions from '../actions/AuthApiActions'
import { FromBackgroundMessages } from '../actions/RootActions'
import * as StrTokenActions from '../actions/StrTokenActions'
import * as TwitchActions from '../actions/TwitchActions'
import * as YoutubeActions from '../actions/YoutubeActions'
import { State } from '../injections/InjectionReducer'

export const FromBackgroundMessageHandler = (
  store: Store<State>,
  message: FromBackgroundMessages,
) => {
  switch (message.type) {
    case AuthApiActions.GET_AUTH_REDUX_STATE_RESPONSE:
    case YoutubeActions.GET_YOUTUBE_INFO_RESPONSE:
    case TwitchActions.GET_TWITCH_INFO_RESPONSE:
    case StrTokenActions.SEND_RESPONSE:
      store.dispatch(message)
      return

    // Deprecated
    case StrTokenActions.UPDATE_WALLET_REQUEST:
      return

    default:
      return
  }
}

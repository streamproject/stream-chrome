import * as AuthApiActions from './AuthApiActions'
import * as PlatformApiActions from './PlatformApiActions'
import * as StrTokenActions from './StrTokenActions'
import * as TrackingActions from './TrackingActions'
import * as TwitchActions from './TwitchActions'
import * as UserApiActions from './UserApiActions'
import * as ViewsActions from './ViewsActions'
import * as YoutubeActions from './YoutubeActions'

export type Actions =
  | AuthApiActions.Actions[keyof AuthApiActions.Actions]
  | PlatformApiActions.Actions[keyof PlatformApiActions.Actions]
  | StrTokenActions.Actions[keyof StrTokenActions.Actions]
  | UserApiActions.Actions[keyof UserApiActions.Actions]
  | ViewsActions.Actions[keyof ViewsActions.Actions]

export const aliases = {
  ...AuthApiActions.aliases,
  ...PlatformApiActions.aliases,
  ...StrTokenActions.aliases,
  ...UserApiActions.aliases,
}

export type FromBackgroundMessages =
  | AuthApiActions.FromBackgroundMessages[keyof AuthApiActions.FromBackgroundMessages]
  | YoutubeActions.FromBackgroundMessages[keyof YoutubeActions.FromBackgroundMessages]
  | StrTokenActions.FromBackgroundMessages[keyof StrTokenActions.FromBackgroundMessages]
  | TwitchActions.FromBackgroundMessages[keyof TwitchActions.FromBackgroundMessages]

export type FromInjectionMessages =
  | TrackingActions.FromInjectionMessages[keyof TrackingActions.FromInjectionMessages]
  | AuthApiActions.FromInjectionMessages[keyof AuthApiActions.FromInjectionMessages]
  | YoutubeActions.FromInjectionMessages[keyof YoutubeActions.FromInjectionMessages]
  | StrTokenActions.FromInjectionMessages[keyof StrTokenActions.FromInjectionMessages]
  | TwitchActions.FromInjectionMessages[keyof TwitchActions.FromInjectionMessages]

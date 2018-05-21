import * as _ from 'lodash'
import * as React from 'react'
import { push } from 'react-router-redux'
import { PlatformModels } from 'shared/dist/models'
import { actionCreators as platformApiActionCreators } from '../actions/PlatformApiActions'
import StreamButton from '../components/StreamButton'
import { RootState } from '../reducers/RootReducer'
import * as styles from './__styles__/ConnectPlatforms.styl'

export type ConnectPlatformsProps = RootState
  & typeof platformApiActionCreators
  & { push: typeof push }

export const PlatformConnectButton = (props: RootState & typeof platformApiActionCreators & {
  platformType: PlatformModels.PlatformTypes,
  className: string,
  serviceName: string,
}) => {
  const platformExists = _(props.api.platforms).find((platform) => platform.platformType === props.platformType)
  if (platformExists) {
    return (
      <StreamButton
        className={props.className}
        onClick={() => props.deletePlatform(props.platformType)}
        secondary
      >
        <i className={styles.icon} />
        <div>Log out of {props.serviceName}</div>
      </StreamButton>
    )
  } else {
    return (
      <StreamButton
        className={props.className}
        onClick={() => props.connectPlatform(props.platformType)}
      >
        <i className={styles.icon} />
        <div>Connect to {props.serviceName}</div>
      </StreamButton>
    )
  }

}

// TODO: Find a better source for these icons
export const YoutubeConnect = (props: RootState & typeof platformApiActionCreators) => (
  <PlatformConnectButton
    {...props}
    className={styles.youtube}
    platformType={PlatformModels.YOUTUBE}
    serviceName="YouTube"
  />
)

export const TwitchConnect = (props: RootState & typeof platformApiActionCreators) => (
  <PlatformConnectButton
    {...props}
    className={styles.twitch}
    platformType={PlatformModels.TWITCH}
    serviceName="Twitch"
  />
)

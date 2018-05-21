import * as _ from 'lodash'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { parse } from 'url'
import { fromInjectionMessageCreators } from '../../actions/TwitchActions'
import { injectionToContent } from '../../utils/ContentProxyUtils'
import * as TwitchUtils from '../../utils/TwitchUtils'
import './__styles__/Twitch.styl'
import Platform from './Platform'
import TipButton from './TipButton'

class Twitch extends Platform {

  // This isn't the best or most exhaustive logic, as the routing scheme for twitch resolves to channels it seems
  // home - /
  // channel - /<channel name>
  // videos - /directory/game/<game name>/videos
  // video - /video/<video Id>
  public static isInjectionTarget() {
    const isValidUrl = TwitchUtils.isTwitchChannelUrl(document.location.href)

    if (!isValidUrl) {
      return false
    }

    const url = parse(document.location.href)
    if (url.pathname.startsWith('/videos')) {
      return false
    }

    if (_(Twitch.getVideoContainer()).isEmpty()) {
      return false
    }

    return true
  }

  public static getVideoContainer() {
    return document.getElementsByClassName('video-player__container')[0] as any
  }

  private channelInfoBarContainer: Element

  constructor() {
    super()
    injectionToContent(fromInjectionMessageCreators.getTwitchInfo())
  }

  public insertTipButton() {
    const insertTipButtonHelper = () => {
      const channelInfoBarContainer = document.getElementsByClassName('channel-info-bar__action-container')[0]
      if (!channelInfoBarContainer || this.channelInfoBarContainer === channelInfoBarContainer) {
        return
      }

      if (this.tipButtonContainer) {
        this.tipButtonContainer.remove()
      }

      this.channelInfoBarContainer = channelInfoBarContainer

      this.tipButtonContainer = document.createElement('div')
      this.tipButtonContainer.setAttribute('id', 'stream-tip-button-container')
      this.tipButtonContainer.setAttribute('class', 'tw-relative')

      this.channelInfoBarContainer.lastChild.appendChild(this.tipButtonContainer)
      const channelName = TwitchUtils.getTwitchUsername(document.location.href)

      ReactDOM.render(
        <Provider store={this.store}>
          <TipButton channelName={channelName} />
        </Provider>,
        this.tipButtonContainer,
      )
    }

    this.tipInjectionIntervalListener = window.setInterval(insertTipButtonHelper, 250)
  }

  public getVideoElement() {
    const videoPlayer = document.getElementsByClassName('video-player')[0]
    return videoPlayer.getElementsByTagName('video')[0]
  }

  public canSetupViewTracking() {
    return !_(this.store.getState().twitchChannelInfo).isEmpty()
  }
}

export default Twitch

import * as _ from 'lodash'
import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { fromInjectionMessageCreators } from '../../actions/YoutubeActions'
import { injectionToContent } from '../../utils/ContentProxyUtils'
import * as YoutubeUtils from '../../utils/YoutubeUtils'
import './__styles__/Youtube.styl'
import Platform from './Platform'
import TipButton from './TipButton'

class Youtube extends Platform {
  public static isInjectionTarget() {
    return YoutubeUtils.isYoutubeVideoUrl(document.location.href) && (window as any).ytplayer
  }

  private subscribeButton: Element

  constructor() {
    super()
    injectionToContent(fromInjectionMessageCreators.getYoutubeInfo())
  }

  public insertTipButton() {
    const insertTipButtonHelper = () => {
      const videoId = YoutubeUtils.getYoutubeVideoId(window.location.href)
      const subscribeButton = document.querySelectorAll(`[video-id="${videoId}"] #meta-contents #subscribe-button`)[0]

      if (!subscribeButton || this.subscribeButton === subscribeButton) {
        return
      }

      if (this.tipButtonContainer) {
        this.tipButtonContainer.remove()
      }
      this.subscribeButton = subscribeButton
      this.tipButtonContainer = document.createElement('div')
      this.tipButtonContainer.setAttribute('id', 'stream-tip-button-container')
      this.subscribeButton.parentNode.insertBefore(this.tipButtonContainer, this.subscribeButton)

      const channelAnchorTag = document.getElementById('owner-container').getElementsByTagName('a')[0]
      const channelName = channelAnchorTag.innerHTML

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
    return (document.getElementsByClassName('video-stream html5-main-video')[0] as HTMLVideoElement)
  }

  public canSetupViewTracking() {
    return !_(this.store.getState().youtubeVideoInfo).isEmpty()
  }
}

export default Youtube

import * as ReactDOM from 'react-dom'
import { createStore, Store } from 'redux'
import { fromInjectionMessageCreators as authApiMessageCreators } from '../../actions/AuthApiActions'
import { fromInjectionMessageCreators as TrackingMessageCreators } from '../../actions/TrackingActions'
import { FromBackgroundMessageHandler } from '../../MessageHandlers/FromBackgroundMessageHandler'
import { CONTENT_TO_INJECTION } from '../../utils/ContentProxyUtils'
import { injectionToContent } from '../../utils/ContentProxyUtils'
import { reducer, State } from '../InjectionReducer'

abstract class Platform {
  protected store: Store<State>
  protected tipButtonContainer: HTMLElement

  protected tipInjectionIntervalListener: number
  protected authInjectionIntervalListener: number
  protected viewIntervalListener: number

  public constructor() {
    this.store = createStore(reducer)

    this.insertTipButton()

    window.addEventListener('message', this.handleMessage)

    this.authInjectionIntervalListener = setInterval(() => {
      if (document.hidden) { return }
      injectionToContent(authApiMessageCreators.getAuthReduxState())
    }, 200)

    this.setupViewTracking()
  }

  public handleMessage = (event: MessageEvent) => {
    if (event.source !== window || event.data.messageType !== CONTENT_TO_INJECTION) {
      return
    }

    FromBackgroundMessageHandler(this.store, (event.data).message)
  }

  public abstract insertTipButton()

  public abstract getVideoElement()

  public cleanUp() {
    if (this.tipButtonContainer) {
      ReactDOM.unmountComponentAtNode(this.tipButtonContainer)
      this.tipButtonContainer.remove()
    }

    clearInterval(this.tipInjectionIntervalListener)
    clearInterval(this.authInjectionIntervalListener)
    clearTimeout(this.viewIntervalListener)
  }

  // https://stackoverflow.com/questions/8599076/detect-if-html5-video-element-is-playing
  public isVideoPlaying = () => {
    const myVideo = this.getVideoElement()
    return myVideo.currentTime > 0 && !myVideo.paused && !myVideo.ended && myVideo.readyState > 2
  }

  public recordViewHandler = () => {
    if (document.hidden || !this.isVideoPlaying()) {
      return
    }

    injectionToContent(TrackingMessageCreators.addNewView())
  }

  // Only record views every 15s
  public setupViewTracking() {
    const removeVideoInfoLoadedListener = this.store.subscribe(() => {
      if (this.canSetupViewTracking()) {
        if (this.viewIntervalListener) {
          clearTimeout(this.viewIntervalListener)
        }
        this.viewIntervalListener = setInterval(this.recordViewHandler, 15000)
        removeVideoInfoLoadedListener()
      }
    })
  }

  // We need to wait for data like youtube/twitch video info to be fetched before we start recording views
  public abstract canSetupViewTracking(): boolean
}

export default Platform

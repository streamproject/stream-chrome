import * as Raven from 'raven-js'
import * as React from 'react'
import { Store } from 'react-chrome-redux'
import * as ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import { RouteComponentProps } from 'react-router'
import { Router } from 'react-router'
import * as injectTapEventPlugin from 'react-tap-event-plugin'
import 'semantic-ui-css/semantic.min.css'
import { SENTRY_URI } from './constants/config'
import { BACKGROUND_POPUP_PORT_NAME } from './constants/config'
import App from './containers/App'

const store = new Store({ portName: BACKGROUND_POPUP_PORT_NAME })

Raven.config(SENTRY_URI).install()

injectTapEventPlugin()

let OSName = 'unknown'
// https://stackoverflow.com/questions/46126780/chrome-extension-popup-size-is-incorrect-sometimes
// https://bugs.chromium.org/p/chromium/issues/detail?id=428044#c13
function forceResize() {
  if (OSName === 'mac') {
    const height = document.body.clientHeight
    document.body.style.height = `${height + 1}px`
    setTimeout(() => document.body.style.height = `${height + 2}px`, 50)
  }
}

window.onload = () => {
  // waiting for getPlatform messes up animation, this works
  if (navigator.appVersion.indexOf('Mac') !== -1) {
    OSName = 'mac'
  }
  // Hack to share myHistory between popup and background
  chrome.runtime.getBackgroundPage((backgroundPage) => {
    store.ready().then(() => {
      const history = (backgroundPage as WindowInterface).myHistory
      const container = document.getElementById('content')
      try {
        ReactDOM.render(
          (
            <Provider store={store}>
              <Router history={history}>
                <App {...({} as RouteComponentProps<any>)} />
              </Router>
            </Provider>
          ),
          container,
          forceResize,
        )
      } catch (e) {
        container.innerHTML = 'Oops, something went wrong! Please close Stream and open to try again.'
      }
    })
  })
}

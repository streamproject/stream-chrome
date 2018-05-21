import * as Analytics from 'analytics.js-loader'
import * as _ from 'lodash'
import * as createRavenMiddleware from 'raven-for-redux'
import * as Raven from 'raven-js'
import { alias, wrapStore } from 'react-chrome-redux'
import { LOCATION_CHANGE, routerMiddleware } from 'react-router-redux'
import { applyMiddleware, compose, createStore, Store } from 'redux'
import persistState, { mergePersistedState } from 'redux-localstorage'
import { createTracker } from 'redux-segment'
import thunk from 'redux-thunk'
import { composeWithDevTools } from 'remote-redux-devtools'
import { aliases, FromInjectionMessages } from './actions/RootActions'
import * as StrTokenActions from './actions/StrTokenActions'
import {
  BACKGROUND_POPUP_PORT_NAME, CONTENT_BACKGROUND_PORT_NAME, LOCAL_STORAGE_KEY, SEGMENT_WRITE_KEY, SENTRY_URI,
} from './constants/config'
import { FromInjectionMessageHandler } from './MessageHandlers/FromInjectionMessageHandler'
import myHistory from './myHistory'
import { setIconToGreyscale } from './reducers/ApiReducers'
import { initialRootState, RootReducer, RootState } from './reducers/RootReducer'
import adapter from './utils/ChromeStorageAreaAdapter'
import { segmentOptions } from './utils/SegmentUtils'

export const TXS_DATA_POLLING_INTERVAL = 5000

export function setupAnalytics() {
  const myWindow = window as WindowInterface
  myWindow.analytics = Analytics({ writeKey: SEGMENT_WRITE_KEY })
  Raven.config(SENTRY_URI).install()
}

export function setupRedux() {
  // See https://github.com/tshaddix/react-chrome-redux/issues/78
  const composeEnhancers = __PRODUCTION__ ? compose :
    composeWithDevTools({ realtime: true, hostname: 'localhost', port: 8000 })

  // Thunk doesn't work directly with react chrome redux. https://github.com/tshaddix/react-chrome-redux/issues/70
  // 1. Send synchronous action and alias it for react-chrom-redux
  // 2. react-chrom-redux alias runs async action
  // 3. react-thunk recognizes and executes async action
  const enhancer = composeEnhancers(
    persistState(adapter(chrome.storage.local), LOCAL_STORAGE_KEY, () => {
      // Icon color has to be rehdryated manually.
      const token = _(store.getState().api.refreshToken).isEmpty()
      setIconToGreyscale(_(token).isEmpty())
    }),
    applyMiddleware(
      alias(aliases),
      thunk,
      routerMiddleware(myHistory),
      createRavenMiddleware(Raven),
      createTracker(segmentOptions),
    ),
  )

  const reducer = mergePersistedState()(RootReducer)

  const store = createStore<RootState>(reducer, initialRootState, enhancer)
  wrapStore(store, { portName: BACKGROUND_POPUP_PORT_NAME })

  return store
}

export function setupReactRouter(store: Store<RootState>) {
  const myWindow = window as WindowInterface
  myWindow.myHistory = myHistory

  // based off of
  // https://github.com/ReactTraining/react-router/blob/master/packages/react-router-redux/modules/ConnectedRouter.js
  // Not necessary, but it does mean that history doesn't add a listener every time popup.tsx is executed
  const locationChangeHandler = (location: any) => {
    store.dispatch({
      type: LOCATION_CHANGE,
      payload: location,
    })
  }

  myHistory.listen(locationChangeHandler)
}

export function setupCommunicationWithContentScript(store: Store<RootState>) {
  chrome.runtime.onConnect.addListener((port) => {
    if (port.name !== CONTENT_BACKGROUND_PORT_NAME) {
      return
    }

    port.onMessage.addListener((message, fromPort) => {
      FromInjectionMessageHandler(store, message as FromInjectionMessages, fromPort)
    })
  })
}

export function setupAutoUpdate() {
  // https://developer.chrome.com/extensions/runtime#event-onUpdateAvailable
  chrome.runtime.onUpdateAvailable.addListener(() => {
    chrome.runtime.reload()
  })
}

export function pollForTxsData(store: Store<RootState>) {
  setInterval(() => {
    if (store.getState().api.refreshToken) {
      store.dispatch(StrTokenActions.actionCreators.getAllTxsData())
    }
  }, TXS_DATA_POLLING_INTERVAL)
}

function setup() {
  const store = setupRedux()
  setupReactRouter(store)
  setupAnalytics()
  setupCommunicationWithContentScript(store)
  setupAutoUpdate()
  pollForTxsData(store)
}

setup()

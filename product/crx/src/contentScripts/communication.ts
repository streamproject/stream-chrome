import * as Raven from 'raven-js'
import { FromBackgroundMessages, FromInjectionMessages } from '../actions/RootActions'
import { CONTENT_BACKGROUND_PORT_NAME, SENTRY_URI } from '../constants/config'
import { contentToInjection, INJECTION_TO_CONTENT, WrappedMessage } from '../utils/ContentProxyUtils'

const setupCommunicationLayer = () => {
  const port = chrome.runtime.connect({ name: CONTENT_BACKGROUND_PORT_NAME })

  window.addEventListener('message', (event: MessageEvent) => {
    const wrappedMessage = event.data as WrappedMessage<FromInjectionMessages>
    if (event.source !== window || !wrappedMessage || wrappedMessage.messageType !== INJECTION_TO_CONTENT) {
      return
    }

    port.postMessage(wrappedMessage.message)
  })

  port.onMessage.addListener((message) => {
    contentToInjection(message as FromBackgroundMessages)
  })
}

function setup() {
  Raven.config(SENTRY_URI).install()

  setupCommunicationLayer()
}

setup()

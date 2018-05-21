import * as Raven from 'raven-js'
import { SENTRY_URI } from '../constants/config'
import Twitch from './components/Twitch'

Raven.config(SENTRY_URI).install()
let twitch: Twitch

function setupInjections() {
  if (Twitch.isInjectionTarget()) {
    if (twitch) {
      twitch.cleanUp()
    }
    twitch = new Twitch()
  }
}

export function setup() {
  setupInjections()
  let currentPage = window.location.href

  // There's way no listen in for changes in the current href, unfortunately.
  setInterval(() => {
    if (document.hidden) { return }
    if (currentPage !== window.location.href) {
      currentPage = window.location.href
      setupInjections()
    }
  }, 500)
}

setup()

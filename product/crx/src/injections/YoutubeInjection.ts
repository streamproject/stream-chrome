import * as Raven from 'raven-js'
import { SENTRY_URI } from '../constants/config'
import Youtube from './components/Youtube'

Raven.config(SENTRY_URI).install()
let youtube: Youtube

function setupInjections() {
  if (Youtube.isInjectionTarget()) {
    if (youtube) {
      youtube.cleanUp()
    }
    youtube = new Youtube()
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
  }, 250)
}

setup()

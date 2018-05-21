import { injectScript } from '../utils/injectScript'

window.addEventListener('load', () => {
  injectScript({ filePath: chrome.extension.getURL('/js/MetamaskInjection.js') })
})

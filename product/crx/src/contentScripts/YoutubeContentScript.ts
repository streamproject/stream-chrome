import { injectScript } from '../utils/injectScript'

injectScript({ filePath: chrome.extension.getURL('/js/YoutubeInjection.js') })

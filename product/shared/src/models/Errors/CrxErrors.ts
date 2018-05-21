export const NETWORK_ERROR = 'NETWORK_ERROR'
export const PLATFORM_INFO_CACHE_MISSING = 'PLATFORM_INFO_CACHE_MISSING'

export const METAMASK_OFF = 'METAMASK_OFF'
export const METAMASK_ACCOUNT_MISMATCH = 'METAMASK_ACCOUNT_MISMATCH'
export const STREAM_USER_MISSING = 'STREAM_USER_MISSING'

export const TOO_MANY_TRIES = 'TOO_MANY_TRIES'

export type ERRORS_TYPE =
  | typeof NETWORK_ERROR
  | typeof PLATFORM_INFO_CACHE_MISSING
  | typeof METAMASK_OFF
  | typeof METAMASK_ACCOUNT_MISMATCH
  | typeof STREAM_USER_MISSING
  | typeof TOO_MANY_TRIES

export const Errors = {
  NETWORK_ERROR: {
    type: NETWORK_ERROR,
    humanized: 'Could not connect. Is your internet working?',
  },
  PLATFORM_INFO_CACHE_MISSING: {
    type: PLATFORM_INFO_CACHE_MISSING,
    humanized: 'Platform info cache missing',
  },
  METAMASK_OFF: {
    type: METAMASK_OFF,
    humanized: 'Your Metamask Chrome extension is either disabled or logged-out. You must enable it to use this feature!',
  },
  METAMASK_ACCOUNT_MISMATCH: {
    type: METAMASK_ACCOUNT_MISMATCH,
    humanized: 'Open your Metamask chrome extension and make sure your currently active wallet matches your Stream-linked "ETH" address!',
  },
  STREAM_USER_MISSING: {
    type: STREAM_USER_MISSING,
    humanized: 'You must be logged in to the Stream Chrome Extension to send Stream Tokens. Open the Stream Chrome Extension and log-in!',
  },
  TOO_MANY_TRIES: {
    type: TOO_MANY_TRIES,
    humanized: 'You have attempted this action too many attempts. Try again later.',
  },
}

export const BACKGROUND_POPUP_PORT_NAME = 'stream'
export const CONTENT_BACKGROUND_PORT_NAME = 'stream_content'
export const BASE_URL = __PRODUCTION__ ? 'https://staging.streamtoken.net/api/v1' : 'http://lvh.me:5000/api/v1'

export const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
export const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY

export const LOCAL_STORAGE_KEY = process.env.LOCAL_STORAGE_KEY

export const EXTENSION_ID = process.env.EXTENSION_ID

export const GA_TRACKING_ID = process.env.GA_TRACKING_ID

export const SENTRY_URI = process.env.SENTRY_URI

export const SEGMENT_WRITE_KEY = process.env.SEGMENT_WRITE_KEY

export const STR_TOKEN_ADDRESS = process.env.STR_TOKEN_ADDRESS

export const STR_SIGNED_TRANSFER_EXPIRATION = process.env.STR_SIGNED_TRANSFER_EXPIRATION

export const LRU_CACHE_MAX_AGE = process.env.LRU_CACHE_MAX_AGE

export const LRU_CACHE_MAX = 100

export const MAXIMUM_LENGTH_ENTRY = 2048

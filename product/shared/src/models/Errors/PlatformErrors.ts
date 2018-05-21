export const OAUTH = 'OAUTH'
export const DUPLICATE_PLATFORM = 'DUPLICATE_PLATFORM'

export type ERRORS_TYPE =
  | typeof OAUTH
  | typeof DUPLICATE_PLATFORM

export const Errors = {
  OAUTH: {
    type: typeof OAUTH,
    humanized: 'Platform connection failed',
  },
  DUPLICATE_PLATFORM: {
    type: typeof DUPLICATE_PLATFORM,
    humanized: 'Platform already connected',
  },
}

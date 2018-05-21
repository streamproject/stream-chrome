export const VIEW_INTERVAL = 'VIEW_INTERVAL'

export type ERRORS_TYPE =
  | typeof VIEW_INTERVAL

export const Errors = {
  VIEW_INTERVAL: {
    type: typeof VIEW_INTERVAL,
    humanized: 'Invalid view',
  },
}

export const ROOT = '/'
export const LOGIN = '/login'
export const SIGNUP = '/signup'

export const TERMS = '/terms'
export const PROFILE_PHOTO = '/profile_photo'
export const PHONE = '/phone'
export const CHECK_PHONE = '/check_phone'
export const WELCOME = '/welcome'
export const CONTENT_CREATOR = '/content_creator'
export const CONNECT_PLATFORMS = '/connect_platforms'
export const WALLET_SETUP = '/wallet_setup'
export const PROMO_GIFT = '/promo_gift'

export const WALLET = '/wallet'
export const MY_ACCOUNT = '/my_account'
export const UPDATE_ADDRESS = '/update_address'

export type Routes =
  | typeof ROOT
  | typeof LOGIN
  | typeof SIGNUP

  | typeof TERMS
  | typeof PROFILE_PHOTO
  | typeof PHONE
  | typeof CHECK_PHONE
  | typeof WELCOME
  | typeof CONTENT_CREATOR
  | typeof CONNECT_PLATFORMS
  | typeof WALLET_SETUP
  | typeof PROMO_GIFT

  | typeof WALLET
  | typeof MY_ACCOUNT
  | typeof UPDATE_ADDRESS

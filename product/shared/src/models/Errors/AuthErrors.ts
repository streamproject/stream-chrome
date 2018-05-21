export const INVALID_EMAIL = 'INVALID_EMAIL'
export const INVALID_USERNAME = 'INVALID_USERNAME'
export const INVALID_PASSWORD = 'INVALID_PASSWORD'
export const INVALID_REFERRER_CODE = 'INVALID_REFERRER_CODE'
export const AUTH_ERROR = 'AUTH_ERROR'
export const EMAIL_TAKEN = 'EMAIL_TAKEN'
export const USERNAME_TAKEN = 'USERNAME_TAKEN'
export const SIGNUP_ERROR = 'SIGNUP_ERROR'
export const LOGOUT_ERROR = 'LOGOUT_ERROR'

export const TOKEN_MISSING = 'TOKEN_MISSING'
export const TOKEN_EXPIRED = 'TOKEN_EXPIRED'
export const TOKEN_ERROR = 'TOKEN_ERROR'

export type ERRORS_TYPE =
  | typeof INVALID_EMAIL
  | typeof INVALID_USERNAME
  | typeof INVALID_PASSWORD
  | typeof INVALID_REFERRER_CODE
  | typeof AUTH_ERROR
  | typeof EMAIL_TAKEN
  | typeof USERNAME_TAKEN
  | typeof SIGNUP_ERROR
  | typeof LOGOUT_ERROR
  | typeof TOKEN_MISSING
  | typeof TOKEN_EXPIRED
  | typeof TOKEN_ERROR

export const Errors = {
  INVALID_EMAIL: {
    type: typeof INVALID_EMAIL,
    humanized: 'Not a valid email address',
  },
  INVALID_USERNAME: {
    type: typeof INVALID_USERNAME,
    humanized: 'Not a valid username',
  },
  INVALID_PASSWORD: {
    type: typeof INVALID_PASSWORD,
    humanized: 'Password must be at least 10 characters and contain 3 of the following: uppercase letters, lowercase letters, numbers, or special characters',
  },
  INVALID_REFERRER_CODE: {
    type: typeof INVALID_REFERRER_CODE,
    humanized: 'Not a valid referral code',
  },
  AUTH_ERROR: {
    type: typeof AUTH_ERROR,
    humanized: 'Invalid username or password',
  },
  EMAIL_TAKEN: {
    type: typeof EMAIL_TAKEN,
    humanized: 'Email taken',
  },
  USERNAME_TAKEN: {
    type: typeof USERNAME_TAKEN,
    humanized: 'Username taken',
  },
  SIGNUP_ERROR: {
    type: typeof SIGNUP_ERROR,
    humanized: 'Signup error',
  },
  LOGOUT_ERROR: {
    type: typeof LOGOUT_ERROR,
    humanized: 'Logout error',
  },
  TOKEN_MISSING: {
    type: typeof TOKEN_MISSING,
    humanized: 'Token missing',
  },
  TOKEN_EXPIRED: {
    type: typeof TOKEN_EXPIRED,
    humanized: 'Token expired',
  },
  TOKEN_ERROR: {
    type: typeof TOKEN_ERROR,
    humanized: 'Token error',
  },
}

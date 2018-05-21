export const NOT_FOUND = 'NOT_FOUND'
export const UPDATE_FAILED = 'UPDATE_FAILED'
export const PHONE_DUPLICATE = 'PHONE_DUPLICATE'
export const INVALID_USER = 'INVALID_USER'
export const ALREADY_VERIFIED = 'ALREADY_VERIFIED'
export const INVALID_ADDRESS = 'INVALID_ADDRESS'
export const DUPLICATE_ADDRESS = 'DUPLICATE_ADDRESS'
export const INVALID_PASSWORD = 'INVALID_PASSWORD'

export const PHONE_INVALID = 'PHONE_INVALID'
export const VERIFY_CODE_INVALID = 'VERIFY_CODE_INVALID'

export const VERIFY_FAILED = 'VERIFY_FAILED'
export const CHECK_FAILED = 'CHECK_FAILED'

export type ERRORS_TYPE =
  | typeof NOT_FOUND
  | typeof UPDATE_FAILED
  | typeof PHONE_DUPLICATE
  | typeof INVALID_USER
  | typeof ALREADY_VERIFIED
  | typeof INVALID_ADDRESS
  | typeof DUPLICATE_ADDRESS
  | typeof INVALID_PASSWORD

  | typeof PHONE_INVALID
  | typeof VERIFY_FAILED
  | typeof VERIFY_CODE_INVALID
  | typeof CHECK_FAILED

export const Errors = {
  NOT_FOUND: {
    type: typeof NOT_FOUND,
    humanized:  'Not found',
  },
  UPDATE_FAILED: {
    type: typeof UPDATE_FAILED,
    humanized: 'Update failed',
  },
  PHONE_DUPLICATE: {
    type: typeof PHONE_DUPLICATE,
    humanized: 'Duplicate phone number',
  },
  INVALID_USER: {
    type: typeof INVALID_USER,
    humanized: 'Invalid user',
  },
  ALREADY_VERIFIED: {
    type: typeof ALREADY_VERIFIED,
    humanized: 'Phone number already verified',
  },
  INVALID_ADDRESS: {
    type: typeof INVALID_ADDRESS,
    humanized: 'Invalid ETH address',
  },
  DUPLICATE_ADDRESS: {
    type: typeof DUPLICATE_ADDRESS,
    humanized: 'This address is already registered to a different',
  },
  INVALID_PASSWORD: {
    type: typeof INVALID_PASSWORD,
    humanized: 'The password entered is invalid',
  },
  PHONE_INVALID: {
    type: typeof PHONE_INVALID,
    humanized: 'Phone number or country code is invalid',
  },
  VERIFY_FAILED: {
    type: typeof VERIFY_FAILED,
    humanized: 'Phone verification failed',
  },
  VERIFY_CODE_INVALID: {
    type: typeof VERIFY_CODE_INVALID,
    humanized: '', // This one is actually handled in PhoneSetupStart since it contains a special link.
  },
  CHECK_FAILED: {
    type: typeof CHECK_FAILED,
    humanized: 'Phone check failed',
  },
}

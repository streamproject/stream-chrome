export const SET_USERNAME = 'SET_USERNAME'
export const SET_EMAIL = 'SET_EMAIL'
export const SET_PASSWORD = 'SET_PASSWORD'
export const SET_REFERRER_CODE = 'SET_REFERRER_CODE'
export const SET_IS_NEW = 'SET_IS_NEW'
export const SET_PROFILE_PHOTO = 'SET_PROFILE_PHOTO'
export const SET_COUNTRY_CODE = 'SET_COUNTRY_CODE'
export const SET_NATIONAL_NUMBER = 'SET_NATIONAL_NUMBER'
export const SET_VERIFICATION_CODE = 'SET_VERIFICATION_CODE'
export const SET_EXCHANGE_AMOUNT = 'SET_EXCHANGE_AMOUNT'
export const VIEWS_RESET = 'VIEWS_RESET'

export type Actions = {
  SET_USERNAME: {
    type: typeof SET_USERNAME,
    username: string,
  },

  SET_EMAIL: {
    type: typeof SET_EMAIL,
    email: string,
  },

  SET_PASSWORD: {
    type: typeof SET_PASSWORD,
    password: string,
  },

  SET_REFERRER_CODE: {
    type: typeof SET_REFERRER_CODE,
    referrerCode: string,
  },

  SET_IS_NEW: {
    type: typeof SET_IS_NEW,
    isNew: boolean,
  },

  SET_PROFILE_PHOTO: {
    type: typeof SET_PROFILE_PHOTO,
    // files aren't serializable over sendMessage, used by react-chrome-redux, so we can only exchange the objectURL
    profilePhotoObjectUrl: string,
  },

  SET_COUNTRY_CODE: {
    type: typeof SET_COUNTRY_CODE,
    countryCode: string,
  }

  SET_NATIONAL_NUMBER: {
    type: typeof SET_NATIONAL_NUMBER,
    nationalNumber: string,
  },

  SET_VERIFICATION_CODE: {
    type: typeof SET_VERIFICATION_CODE,
    verificationCode: string,
  },

  SET_EXCHANGE_AMOUNT: {
    type: typeof SET_EXCHANGE_AMOUNT,
    amount: string,
  },

  VIEWS_RESET: {
    type: typeof VIEWS_RESET,
  },
}

export const actionCreators = {
  setUsername(username: string): Actions[typeof SET_USERNAME] {
    return { type: SET_USERNAME, username }
  },

  setEmail(email: string): Actions[typeof SET_EMAIL] {
    return { type: SET_EMAIL, email }
  },

  setPassword(password: string): Actions[typeof SET_PASSWORD] {
    return { type: SET_PASSWORD, password }
  },

  setReferrerCode(referrerCode: string): Actions[typeof SET_REFERRER_CODE] {
    return { type: SET_REFERRER_CODE, referrerCode }
  },

  setIsNew(isNew: boolean): Actions[typeof SET_IS_NEW] {
    return { type: SET_IS_NEW, isNew }
  },

  setProfilePhoto(profilePhotoObjectUrl: string): Actions[typeof SET_PROFILE_PHOTO] {
    return { type: SET_PROFILE_PHOTO, profilePhotoObjectUrl }
  },

  setCountryCode(countryCode: string): Actions[typeof SET_COUNTRY_CODE] {
    return { type: SET_COUNTRY_CODE, countryCode }
  },

  setNationalNumber(nationalNumber: string): Actions[typeof SET_NATIONAL_NUMBER] {
    return { type: SET_NATIONAL_NUMBER, nationalNumber }
  },

  setVerificationCode(verificationCode: string): Actions[typeof SET_VERIFICATION_CODE] {
    return { type: SET_VERIFICATION_CODE, verificationCode }
  },

  setExchangeAmount(amount: string): Actions[typeof SET_EXCHANGE_AMOUNT] {
    return { type: SET_EXCHANGE_AMOUNT, amount }
  },

  reset(): Actions[typeof VIEWS_RESET] {
    return { type: VIEWS_RESET }
  },
}

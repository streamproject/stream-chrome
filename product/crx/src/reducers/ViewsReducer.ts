import { Reducer } from 'redux'
import { Actions, SET_COUNTRY_CODE, SET_EMAIL, SET_EXCHANGE_AMOUNT,
  SET_IS_NEW, SET_NATIONAL_NUMBER, SET_PASSWORD, SET_PROFILE_PHOTO,
  SET_REFERRER_CODE, SET_USERNAME, SET_VERIFICATION_CODE, VIEWS_RESET} from '../actions/ViewsActions'

export type State = {
  readonly username: string,
  readonly email: string,
  readonly password: string,
  readonly referrerCode: string,
  readonly isNew: boolean,
  readonly profilePhotoObjectUrl: string,
  readonly countryCode: string,
  readonly nationalNumber: string,
  readonly verificationCode: string,
  readonly exchangeAmount: string,
}

export const initialState: State = {
  username: '',
  email: '',
  password: '',
  referrerCode: '',
  isNew: false,
  profilePhotoObjectUrl: '',
  countryCode: '+1',
  nationalNumber: '',
  verificationCode: '',
  exchangeAmount: '',
}

export const reducer: Reducer<State> = (state = initialState, action: Actions[keyof Actions]) => {
  switch (action.type) {
    case SET_USERNAME:
      return {
        ...state,
        username: (action as Actions[typeof SET_USERNAME]).username,
      }

    case SET_EMAIL:
      return {
        ...state,
        email: (action as Actions[typeof SET_EMAIL]).email,
      }

    case SET_PASSWORD:
      return {
        ...state,
        password: (action as Actions[typeof SET_PASSWORD]).password,
      }

    case SET_REFERRER_CODE:
      return {
        ...state,
        referrerCode: (action as Actions[typeof SET_REFERRER_CODE]).referrerCode,
      }

    case SET_IS_NEW:
      return {
        ...state,
        isNew: (action as Actions[typeof SET_IS_NEW]).isNew,
      }

    case SET_PROFILE_PHOTO:
      return {
        ...state,
        profilePhotoObjectUrl: (action as Actions[typeof SET_PROFILE_PHOTO]).profilePhotoObjectUrl,
      }

    case SET_COUNTRY_CODE:
      return {
        ...state,
        countryCode: (action as Actions[typeof SET_COUNTRY_CODE]).countryCode,
      }

    case SET_NATIONAL_NUMBER:
      return {
        ...state,
        nationalNumber: (action as Actions[typeof SET_NATIONAL_NUMBER]).nationalNumber,
      }

    case SET_VERIFICATION_CODE:
      return {
        ...state,
        verificationCode: (action as Actions[typeof SET_VERIFICATION_CODE]).verificationCode,
      }

    case SET_EXCHANGE_AMOUNT:
      return {
        ...state,
        exchangeAmount: (action as Actions[typeof SET_EXCHANGE_AMOUNT]).amount,
      }

    case VIEWS_RESET:
      return { ...initialState }

    default:
      return state
  }
}

import * as AuthErrors from './AuthErrors'
import * as CrxErrors from './CrxErrors'
import * as PlatformErrors from './PlatformErrors'
import * as TrackingErrors from './TrackingErrors'
import * as TxErrors from './TxErrors'
import * as UserErrors from './UserErrors'

export {
  AuthErrors,
  UserErrors,
  PlatformErrors,
  TxErrors,
  TrackingErrors,
  CrxErrors,
}

export type ERRORS_TYPE =
  | AuthErrors.ERRORS_TYPE
  | UserErrors.ERRORS_TYPE
  | PlatformErrors.ERRORS_TYPE
  | TxErrors.ERRORS_TYPE
  | TrackingErrors.ERRORS_TYPE
  | CrxErrors.ERRORS_TYPE

export function humanize(error: ERRORS_TYPE) {
  const errorAction = AuthErrors.Errors[error]
    || CrxErrors.Errors[error]
    || PlatformErrors.Errors[error]
    || TxErrors.Errors[error]
    || TrackingErrors.Errors[error]
    || UserErrors.Errors[error]

  return errorAction ? errorAction.humanized : error
}

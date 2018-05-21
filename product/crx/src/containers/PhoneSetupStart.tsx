import * as classNames from 'classnames'
import * as _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import * as Errors from 'shared/dist/models/Errors'
import { actionCreators as authApiActionCreators } from '../actions/AuthApiActions'
import { actionCreators as userApiActionCreators } from '../actions/UserApiActions'
import { actionCreators as viewsActionCreators } from '../actions/ViewsActions'
import * as commonStyles from '../components/__styles__/common.styl'
import Footer from '../components/Footer'
import StreamButton from '../components/StreamButton'
import TextField from '../components/TextField'
import { RootState } from '../reducers/RootReducer'
import * as styles from './__styles__/PhoneSetupStart.styl'
import BackButton from './BackButton'
import Header from './Header'

const possibleErrors = new Set([
  Errors.CrxErrors.NETWORK_ERROR,
  Errors.UserErrors.VERIFY_FAILED,
  Errors.UserErrors.PHONE_INVALID,
  Errors.UserErrors.PHONE_DUPLICATE,
])

const PhoneSetupStart = (props: RootState
  & typeof viewsActionCreators
  & typeof userApiActionCreators
  & typeof authApiActionCreators,
) => {
  const isValid = !possibleErrors.has(props.api.error)

  return (
    <div className={commonStyles.popup}>
      <Header />
      <div className={commonStyles.title}>Verify your Identity</div>
      <div className={classNames(commonStyles.container, commonStyles.text)}>
        For your security, we need to verify if it’s you by sending you an
        authorization code. Please enter your phone number below
      </div>
      <div className={classNames(commonStyles.container, styles.inputContainer)}>
        <TextField
          directions="Enter your country code"
          className={styles.countryCode}
          fluid
          type="tel"
          placeholder="+1"
          value={props.views.countryCode}
          onChange={(event, data) => props.setCountryCode(data.value)}
          showValidation
          isValid={isValid}
          onTypingDone={() => props.setUserError(null)}
        />
        <TextField
          directions="Enter your phone number"
          className={styles.nationalNumber}
          fluid
          type="tel"
          placeholder="(###)###-####"
          value={props.views.nationalNumber}
          onChange={(event, data) => props.setNationalNumber(data.value)}
          showValidation
          isValid={isValid}
          errorMessage={Errors.humanize(props.api.error)}
          onTypingDone={() => props.setUserError(null)}
        />
      </div>
      <div className={classNames(commonStyles.container, commonStyles.caption, styles.captionContainer)}>
        We use your phone number ony one time to complete this security check.
      </div>
      <div className={commonStyles.navigation}>
        <BackButton
          onClick={() => props.logout()}
        />
        <StreamButton
          onClick={() => props.verifyPhone({
            nationalNumber: props.views.nationalNumber,
            countryCode: props.views.countryCode,
          })}
          primary
          disabled={_(props.views.countryCode).isEmpty() || _(props.views.nationalNumber).isEmpty()}
        >
          Send Code
        </StreamButton>
      </div>
      <Footer />
    </div>
  )
}

const mapStateToProps = (state: RootState) => state
const mapDispatchToProps = (dispatch: Dispatch<RootState>) =>
  bindActionCreators({ ...userApiActionCreators, ...viewsActionCreators, ...authApiActionCreators }, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(PhoneSetupStart)

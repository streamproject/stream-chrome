import * as classNames from 'classnames'
import * as _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import * as Errors from 'shared/dist/models/Errors'
import { actionCreators as userApiActionCreators } from '../actions/UserApiActions'
import { actionCreators as viewsActionCreators } from '../actions/ViewsActions'
import * as commonStyles from '../components/__styles__/common.styl'
import StreamButton from '../components/StreamButton'
import TextField from '../components/TextField'
import { RootState } from '../reducers/RootReducer'
import * as styles from './__styles__/PhoneSetupCheck.styl'
import BackButton from './BackButton'
import Header from './Header'

type PhoneSetupCheckProps = RootState
& typeof viewsActionCreators
& typeof userApiActionCreators

const possibleErrors = new Set([
  Errors.CrxErrors.NETWORK_ERROR,
  Errors.UserErrors.CHECK_FAILED,
  Errors.UserErrors.VERIFY_CODE_INVALID,
])

class PhoneSetupCheck extends React.Component<PhoneSetupCheckProps, null> {
  public checkPhone = () => this.props.checkPhone({
    verificationCode: this.props.views.verificationCode,
    nationalNumber: this.props.views.nationalNumber,
    countryCode: this.props.views.countryCode,
  })

  public getNewCode = () => {
    this.props.verifyPhone({
      nationalNumber: this.props.views.nationalNumber,
      countryCode: this.props.views.countryCode,
    })

    this.props.setUserError(null)
  }

  public render() {
    const isValid = !possibleErrors.has(this.props.api.error)
    const errorMessage = (
      <span>
        Code is either incorrect, or has expired.
        {' '}
        <a onClick={this.getNewCode}>Send a new code</a>
      </span>
    )

    return (
      <div className={commonStyles.popup}>
        <Header />
        <div className={commonStyles.title}>Enter and submit authorization code</div>
        <div className={classNames(commonStyles.container, commonStyles.text)}>
          We’ve sent you a one-time code via text to your mobile number {this.props.views.nationalNumber}.
          Check your mobile phone and enter the code.
        </div>
        <div className={classNames(commonStyles.container, styles.inputContainer)}>
          <TextField
            directions="Enter your security code"
            type="number"
            placeholder="123456"
            value={this.props.views.verificationCode}
            onChange={(event, data) => this.props.setVerificationCode(data.value)}
            showValidation
            isValid={isValid}
            onTypingDone={() => this.props.setUserError(null)}
            errorMessage={errorMessage}
          />
        </div>
        <div className={commonStyles.navigation}>
          <BackButton />
          <StreamButton
            onClick={this.checkPhone}
            primary
            disabled={_(this.props.views.verificationCode).isEmpty()}
          >
            Submit
          </StreamButton>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state: RootState) => state
const mapDispatchToProps = (dispatch: Dispatch<RootState>) =>
  bindActionCreators({ ...userApiActionCreators, ...viewsActionCreators }, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(PhoneSetupCheck)

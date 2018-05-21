import * as classNames from 'classnames'
import * as _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { push } from 'react-router-redux'
import { bindActionCreators, Dispatch } from 'redux'
import * as Errors from 'shared/dist/models/Errors'
import { actionCreators as authApiActionCreators } from '../actions/AuthApiActions'
import { actionCreators as viewsActionCreators } from '../actions/ViewsActions'
import * as commonStyles from '../components/__styles__/common.styl'
import Footer from '../components/Footer'
import StreamButton from '../components/StreamButton'
import TextField from '../components/TextField'
import { MAXIMUM_LENGTH_ENTRY } from '../constants/config'
import * as Routes from '../constants/routes'
import { RootState } from '../reducers/RootReducer'
import * as styles from './__styles__/Signup.styl'
import Header from './Header'

type SignupProps = typeof viewsActionCreators
  & typeof authApiActionCreators
  & RootState
  & { push: typeof push }

type SignupState = {
  confirmedPassword: string,
}

class Signup extends React.Component<SignupProps, SignupState> {

  constructor(props) {
    super(props)
    this.state = {
      confirmedPassword: '',
    }
  }

  public clearErrorsAndCheckSignupForm = () => {
    this.props.setAuthError(null)

    // Preventative measure to avoid DDOS by sending 1GB length entries to server.
    if (this.props.views.username.length > MAXIMUM_LENGTH_ENTRY) {
      this.props.setAuthError(Errors.AuthErrors.INVALID_USERNAME)
    } else if (this.props.views.email.length > MAXIMUM_LENGTH_ENTRY) {
      this.props.setAuthError(Errors.AuthErrors.INVALID_EMAIL)
    } else if (this.props.views.password.length > MAXIMUM_LENGTH_ENTRY) {
      this.props.setAuthError(Errors.AuthErrors.INVALID_PASSWORD)
    } else {
      this.props.checkSignup({
        email: this.props.views.email,
        username: this.props.views.username,
        password: this.props.views.password,
      })
    }
  }

  public render() {
    const { views: { username, email, password }, api: { loading } } = this.props

    const networkValid = this.props.api.error !== Errors.CrxErrors.NETWORK_ERROR

    const isUsernameValid = !_(username).isEmpty()
      && networkValid
      && !(new Set([Errors.AuthErrors.INVALID_USERNAME, Errors.AuthErrors.USERNAME_TAKEN,
        Errors.CrxErrors.TOO_MANY_TRIES])).has(this.props.api.error)

    const isEmailValid = !_(email).isEmpty()
      && networkValid
      && !(new Set([Errors.AuthErrors.INVALID_EMAIL, Errors.AuthErrors.EMAIL_TAKEN,
        Errors.CrxErrors.TOO_MANY_TRIES])).has(this.props.api.error)

    const isPasswordValid = !_(password).isEmpty()
      && networkValid
      && !_(this.state.confirmedPassword).isEmpty()
      && this.state.confirmedPassword === password
      && !(new Set([Errors.AuthErrors.INVALID_PASSWORD, Errors.CrxErrors.TOO_MANY_TRIES])).has(this.props.api.error)

    // TODO(Referral): Referral system disabled while legal is in flux. Can be enabled simply by
    // unflagging the commented lines here and below.
    // const isReferralValid = networkValid
    //  && !(new Set([Errors.AuthErrors.INVALID_REFERRER_CODE])).has(this.props.api.error)
    const isReferralValid = true

    const isFormValid = networkValid && isUsernameValid && isEmailValid && isPasswordValid && isReferralValid

    return (
      <div className={classNames(commonStyles.popup, styles.signup)} >
        <Header className={styles.header} />
        <div className={classNames(commonStyles.title, styles.title)}>
          Sign Up
        </div>
        <form onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          this.props.push(Routes.TERMS)
          return false
        }}>
          <div className={commonStyles.container}>
            <TextField
              nightMode
              className={styles.field}
              placeholder="Username"
              type="text"
              value={username}
              onChange={(event, data) => this.props.setUsername(data.value)}
              showValidation={!_(this.props.views.username).isEmpty() && !loading}
              isValid={isUsernameValid}
              onTypingDone={this.clearErrorsAndCheckSignupForm}
              errorMessage={Errors.humanize(this.props.api.error)}
              required
            />
          </div>
          <div className={commonStyles.container}>
            <TextField
              nightMode
              className={styles.field}
              placeholder="Email address"
              type="email"
              value={email}
              onChange={(event, data) => this.props.setEmail(data.value)}
              showValidation={!_(this.props.views.email).isEmpty() && !loading}
              isValid={isEmailValid}
              onTypingDone={this.clearErrorsAndCheckSignupForm}
              errorMessage={Errors.humanize(this.props.api.error)}
              required
            />
          </div>
          <div className={commonStyles.container}>
            <TextField
              nightMode
              className={styles.field}
              placeholder="New password"
              type="password"
              value={password}
              onChange={(event, data) => this.props.setPassword(data.value)}
              showValidation={!_(password).isEmpty() && !_(this.state.confirmedPassword).isEmpty() && !loading}
              isValid={isPasswordValid}
              onTypingDone={this.clearErrorsAndCheckSignupForm}
              errorMessage={Errors.humanize(this.props.api.error) || 'Passwords do not match'}
              required
            />
          </div>
          <div className={commonStyles.container}>
            <TextField
              nightMode
              className={styles.field}
              placeholder="Confirm password"
              type="password"
              value={this.state.confirmedPassword}
              onChange={(event, data) => this.setState({ confirmedPassword: data.value })}
              showValidation={!_(password).isEmpty() && !_(this.state.confirmedPassword).isEmpty() && !loading}
              isValid={isPasswordValid}
              onTypingDone={this.clearErrorsAndCheckSignupForm}
              errorMessage={Errors.humanize(this.props.api.error) || 'Passwords do not match'}
              required
            />
          </div>
          {/* TODO(Referral): Referral system is disabled while legal is in flux. */}
          {/* <div className={commonStyles.container}>
            <TextField
              nightMode
              className={styles.field}
              placeholder="Referral Code (optional)"
              type="text"
              value={referrerCode}
              onChange={(event, data) => this.props.setReferrerCode(data.value)}
              showValidation={!loading}
              isValid={isReferralValid}
              onTypingDone={this.clearErrorsAndCheckSignupForm}
              errorMessage={Errors.humanize(this.props.api.error)}
            />
          </div> */}
          <div className={commonStyles.container}>
            <StreamButton
              primary
              type="submit"
              disabled={!isFormValid}
            >
              Next
            </StreamButton>
          </div>
        </form>
        <Footer className={styles.footer}>
          <div>{'Already have an account? '}<Link to={Routes.LOGIN}>Log in</Link></div>
        </Footer>
      </div >
    )
  }
}

const mapStateToProps = (state: RootState) => state

const mapDispatchToProps = (dispatch: Dispatch<RootState>) => bindActionCreators(
  { ...viewsActionCreators,  ...authApiActionCreators, push }, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Signup)

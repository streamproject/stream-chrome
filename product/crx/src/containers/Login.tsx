import * as _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { bindActionCreators, Dispatch } from 'redux'
import * as Errors from 'shared/dist/models/Errors'
import { actionCreators as authApiActionCreators } from '../actions/AuthApiActions'
import { actionCreators as viewsActionCreators } from '../actions/ViewsActions'
import * as commonStyles from '../components/__styles__/common.styl'
import Footer from '../components/Footer'
import StreamButton from '../components/StreamButton'
import TextField from '../components/TextField'
import * as Routes from '../constants/routes'
import { RootState } from '../reducers/RootReducer'
import * as styles from './__styles__/Login.styl'
import Header from './Header'

const possibleErrors = new Set([Errors.CrxErrors.NETWORK_ERROR, Errors.AuthErrors.AUTH_ERROR])

const Login = (props: RootState & typeof viewsActionCreators & typeof
  authApiActionCreators & RootState) => (
  <div className={commonStyles.popup} >
    <Header />
    <div className={commonStyles.title}>Log In</div>
    <form onSubmit={(e) => {
      e.preventDefault()
      e.stopPropagation()
      props.login({ username: props.views.username, password: props.views.password })
      return false
    }}>
      <div className={commonStyles.container}>
        <TextField
          className={styles.username}
          placeholder="Username"
          type="text"
          value={props.views.username}
          onChange={(event, data) => props.setUsername(data.value)}
          showValidation={possibleErrors.has(props.api.error)}
          isValid={!possibleErrors.has(props.api.error)}
          errorMessage={Errors.humanize(props.api.error)}
          onTypingDone={() => props.setAuthError(null)}
        />
      </div>
      <div className={commonStyles.container}>
        <TextField
          className={styles.password}
          placeholder="Password"
          type="password"
          value={props.views.password}
          onChange={(event, data) => props.setPassword(data.value)}
          showValidation={possibleErrors.has(props.api.error)}
          isValid={!possibleErrors.has(props.api.error)}
          errorMessage={Errors.humanize(props.api.error)}
          onTypingDone={() => props.setAuthError(null)}
        />
      </div>
      <div className={commonStyles.container}>
        <StreamButton
          primary
          type="submit"
          disabled={_(props.views.username).isEmpty() || _(props.views.password).isEmpty()}
        >
          Login
        </StreamButton>
      </div>
    </form>
    <Footer>
      <div>{'Don’t have an account? '}<Link to={Routes.SIGNUP}>Sign up</Link></div>
    </Footer>
  </div >
)

const mapStateToProps = (state: RootState) => state

const mapDispatchToProps = (dispatch: Dispatch<RootState>) => bindActionCreators(
  { ...viewsActionCreators,  ...authApiActionCreators }, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Login)

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
import * as Routes from '../constants/routes'
import { RootState } from '../reducers/RootReducer'
import * as styles from './__styles__/UpdateAddress.styl'
import BackButton from './BackButton'
import Header from './Header'

type UpdateAddressProps = RootState
  & typeof userApiActionCreators
  & typeof viewsActionCreators

const UpdateAddressErrors = new Set([
  Errors.UserErrors.INVALID_ADDRESS,
  Errors.UserErrors.DUPLICATE_ADDRESS,
  Errors.UserErrors.INVALID_PASSWORD,
])
const UpdateAddress = (props: UpdateAddressProps) => {
  let errorMessage: string = null
  if (_(props.str.address).isEmpty()) {
    errorMessage = 'Not logged in on metamask'
  // TODO: Remove this error if the user clicks anywhere?
  } else if (UpdateAddressErrors.has(props.api.error)) {
    errorMessage = Errors.humanize(props.api.error)
  }

  // api address != str address => update; otherwise instruct how to update

  return (
    <div className={commonStyles.popup}>
      <Header />
      <div className={commonStyles.title}>Update your ETH address</div>
      <div className={commonStyles.container}>
        <div className={styles.address}>
          {props.api.address}
        </div>
      </div>
      { props.api.address === props.str.address ? (
        <div>
          <div className={commonStyles.container}>
            <p className={commonStyles.text}>
              This is your public address used by the Stream Chrome Extension
              to send and receive Stream Token (STR), the same as the public
              address of your MetaMask wallet.
            </p>
            <p className={commonStyles.text}>
              In order to change it, you must
              first change the active address of your MetaMask wallet, and then
              refresh the current webpage.
            </p>
          </div>
          {errorMessage ? (
            <div className={commonStyles.container}>
              <div className={styles.error}>{errorMessage}</div>
            </div>
          ) : null}
          <div className={commonStyles.navigation}>
            <BackButton />
          </div>
        </div>
      ) : (
        <div>
          <div className={commonStyles.container}>
            <p className={commonStyles.text}>
              This is your public address currently in use by the Stream Chrome Extension
              to send and receive Stream Token (STR).
            </p>
          </div>
          <div className={commonStyles.container}>
            <div className={styles.address}>
              {props.str.address}
            </div>
          </div>
          <div className={commonStyles.container}>
            <p className={commonStyles.text}>
              This is the public address of your MetaMask wallet. Type in your password and
              press "Update" to change the address in use by the Stream Chrome Extension
              to this address.
            </p>
          </div>
          {errorMessage ? (
            <div className={commonStyles.container}>
              <div className={styles.error}>{errorMessage}</div>
            </div>
          ) : null}
          <div className={commonStyles.container}>
            <TextField
              className={styles.password}
              placeholder="Password"
              type="password"
              value={props.views.password}
              onChange={(event, data) => props.setPassword(data.value)}
              // showValidation={possibleErrors.has(props.api.error)} // TODO: validate password
              // isValid={!possibleErrors.has(props.api.error)} // TODO: validate password
              errorMessage={Errors.humanize(props.api.error)}
              // onTypingDone={() => props.setAuthError(null)} // TODO: validate password
            />
          </div>
          <div className={commonStyles.navigation}>
            <BackButton />
            <StreamButton
              onClick={() => props.updateUser(
                { password: props.views.password, address: props.str.address },
                Routes.WALLET,
              )}
              disabled={_(props.str.address).isEmpty() || _(props.views.password).isEmpty()}
              primary
            >
              Update
            </StreamButton>
          </div>
        </div>
      )}

    </div >
  )
}

const mapStateToProps = (state: RootState) => state
const mapDispatchToProps = (dispatch: Dispatch<RootState>) => bindActionCreators(
  { ...userApiActionCreators, ...viewsActionCreators }, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(UpdateAddress)

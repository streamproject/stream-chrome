import * as _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import * as Errors from 'shared/dist/models/Errors'
import { actionCreators as userApiActionCreators } from '../actions/UserApiActions'
import { actionCreators as viewsActionCreators } from '../actions/ViewsActions'
import * as commonStyles from '../components/__styles__/common.styl'
import StreamButton from '../components/StreamButton'
import * as Routes from '../constants/routes'
import { RootState } from '../reducers/RootReducer'
import * as styles from './__styles__/WalletSetup.styl'
import BackButton from './BackButton'
import Header from './Header'

type WalletProps = RootState
  & typeof userApiActionCreators
  & typeof viewsActionCreators

const WalletErrors = new Set([Errors.UserErrors.INVALID_ADDRESS, Errors.UserErrors.DUPLICATE_ADDRESS])
const WalletSetup = (props: WalletProps) => {
  let errorMessage: string = null
  if (_(props.str.address).isEmpty()) {
    errorMessage = 'Not logged in on metamask'
  // TODO: Remove this error if the user clicks anywhere?
  } else if (WalletErrors.has(props.api.error)) {
    errorMessage = Errors.humanize(props.api.error)
  }

  return (
    <div className={commonStyles.popup}>
      <Header />
      <div className={commonStyles.title}>Confirm your ETH address</div>
      <div className={commonStyles.container}>
        <div className={styles.address}>
          {props.str.address}
        </div>
      </div>
      {errorMessage ? (
        <div className={commonStyles.container}>
          <div className={styles.error}>{errorMessage}</div>
        </div>
      ) : null}
      <div className={commonStyles.container}>
        <p className={commonStyles.text}>
          This is the public address of your MetaMask wallet, and it is now
          in use by the Stream Chrome Extension to send and receive Stream
          Token (STR). You will need to make sure
          your MetaMask chrome extension is on, and configured to this
          address, in order to send and receive Stream Tokens in the future.
          You can change your wallet address later in your Account Settings.

          If you do not see an address, make sure you are logged into Metamask,
          and try refreshing your page.
        </p>
      </div>
      <div className={commonStyles.navigation}>
        <BackButton />
        <StreamButton
          onClick={() => props.updateUser(
            { address: props.str.address },
            props.str.promoRedeemed ? Routes.WALLET : Routes.PROMO_GIFT,
          )}
          disabled={_(props.str.address).isEmpty()}
          primary
        >
          Confirm
        </StreamButton>
      </div>
    </div >
  )
}

const mapStateToProps = (state: RootState) => state
const mapDispatchToProps = (dispatch: Dispatch<RootState>) => bindActionCreators(
  { ...userApiActionCreators, ...viewsActionCreators }, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(WalletSetup)

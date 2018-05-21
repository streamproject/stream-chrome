import * as classNames from 'classnames'
import * as React from 'react'
import { connect } from 'react-redux'
import { Route } from 'react-router'
import { AnimatedSwitch } from 'react-router-transition'
import * as globalStyles from '../components/__styles__/global.styl'
import * as Routes from '../constants/routes'
import { RootState } from '../reducers/RootReducer'
import * as styles from './__styles__/App.styl'
import Account from './Account'
import ContentCreator from './ContentCreator'
import Login from './Login'
import MetaMaskSetup from './MetaMaskSetup'
import PhoneSetupCheck from './PhoneSetupCheck'
import PhoneSetupStart from './PhoneSetupStart'
import ProfilePhoto from './ProfilePhoto'
import PromoGift from './PromoGift'
import Signup from './Signup'
import Terms from './Terms'
import UpdateAddress from './UpdateAddress'
import Wallet from './Wallet'
import WalletSetup from './WalletSetup'
import Welcome from './Welcome'

const App = (props: RootState) => {
  return (
    <div className={classNames(styles.content, globalStyles.global)}>
      <AnimatedSwitch
        atEnter={{ opacity: 0 }}
        atLeave={{ opacity: 0 }}
        atActive={{ opacity: 1 }}
        className={styles.switchWrapper}
        location={props.router.location}
      >
        <Route exact path={Routes.ROOT} component={Signup} />

        <Route exact path={Routes.LOGIN} component={Login} />

        <Route exact path={Routes.SIGNUP} component={Signup} />
        <Route exact path={Routes.TERMS} component={Terms} />
        <Route exact path={Routes.PHONE} component={PhoneSetupStart} />
        <Route exact path={Routes.CHECK_PHONE} component={PhoneSetupCheck} />
        <Route exact path={Routes.WELCOME} component={Welcome} />
        <Route exact path={Routes.CONTENT_CREATOR} component={ContentCreator} />
        <Route exact path={Routes.WALLET_SETUP} component={
          props.str.web3Exists ? WalletSetup : MetaMaskSetup
        } />

        <Route exact path={Routes.PROMO_GIFT} component={PromoGift} />

        <Route exact path={Routes.WALLET} component={Wallet} />
        <Route exact path={Routes.MY_ACCOUNT} component={Account} />
        <Route exact path={Routes.UPDATE_ADDRESS} component={
          !props.str.web3Exists ? MetaMaskSetup :
          !props.api.address ? WalletSetup :
          UpdateAddress
        } />
        <Route exact path={Routes.PROFILE_PHOTO} component={ProfilePhoto} />
      </AnimatedSwitch>
    </div>
  )
}

// I give up on React Router's withRouter. this actually works. The former doesn't.
const mapStateToProps = (state: RootState) => state
export default connect(mapStateToProps)(App)

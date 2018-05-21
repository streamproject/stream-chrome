import * as classNames from 'classnames'
import * as _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { push } from 'react-router-redux'
import { bindActionCreators, Dispatch } from 'redux'
import * as commonStyles from '../components/__styles__/common.styl'
import Footer from '../components/Footer'
import StreamButton from '../components/StreamButton'
import * as Routes from '../constants/routes'
import { RootState } from '../reducers/RootReducer'
import * as styles from './__styles__/PromoGift.styl'
import BackButton from './BackButton'

const PromoGiftWithWallet = (props: RootState & { push: typeof push }) => (
  <div className={commonStyles.popup}>
    <div className={styles.bannerContainer}>
      <div className={styles.banner}>
        <i className={styles.markIcon} />
        <div className={styles.number}><strong>500</strong></div>
      </div>
    </div>
    <div className={commonStyles.title}>Signup bonus</div>
    <div className={classNames(commonStyles.container, commonStyles.text, styles.text)}>
      All done! We gave you 500 Stream Tokens as a thank you for signing up early!
      You’ll be able to redeem your tokens for Ethereum or other currencies, after
      the tokens are liquid.
    </div>
    <div className={commonStyles.navigation}>
      <BackButton />
      <StreamButton
        onClick={() => props.push(Routes.WALLET)}
        fluid
        primary
      >
        Done
      </StreamButton>
    </div>
  </div >
)

const PromoGiftNoWallet = (props: RootState & { push: typeof push }) => (
  <div className={commonStyles.popup}>
    <div className={styles.bannerContainer}>
      <div className={styles.banner}>
        <i className={styles.markIcon} />
        <div className={styles.number}>500</div>
      </div>
    </div>
    <div className={commonStyles.title}>Collect your sign up bonus</div>
    <div className={classNames(commonStyles.container, commonStyles.text, styles.text)}>
      All done! We gave you 500 Stream Tokens as a thank you for signing up
      early! You’ll be able to redeem your tokens for Ethereum or other
      currencies, after the tokens are liquid.
    </div>
    <div className={commonStyles.navigation}>
      <BackButton />
      <StreamButton
        onClick={() => props.push(Routes.WALLET_SETUP)}
        fluid
        primary
      >
        Setup wallet
      </StreamButton>
    </div>
    <Footer>
      <div><Link to={Routes.MY_ACCOUNT}>Do this later</Link></div>
    </Footer>
  </div >
)

const PromoGift = (props: RootState & { push: typeof push }) => (
  _(props.api.address).isEmpty() ? <PromoGiftNoWallet {...props} /> : <PromoGiftWithWallet {...props} />
)

const mapStateToProps = (state: RootState) => state
const mapDispatchToProps = (dispatch: Dispatch<RootState>) => bindActionCreators({ push }, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(PromoGift)

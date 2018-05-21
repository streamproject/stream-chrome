import * as classNames from 'classnames'
import * as React from 'react'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { bindActionCreators, Dispatch } from 'redux'
import * as commonStyles from '../components/__styles__/common.styl'
import StreamButton from '../components/StreamButton'
import * as Routes from '../constants/routes'
import { RootState } from '../reducers/RootReducer'
import * as styles from './__styles__/MetaMaskSetup.styl'
import BackButton from './BackButton'
import Header from './Header'

const MetamaskSetup = (props: { push: typeof push }) => {
  return (
    <div className={commonStyles.popup}>
      <Header menuEnabled />
      <div className={commonStyles.title}>Create a new ETH address</div>
      <div className={classNames(commonStyles.container, commonStyles.text, styles.text)}>
        In order to send and receive Stream Tokens, we require all users create a
        wallet using MetaMask, a trusted third-party chrome extension that securely
        stores your wallet address & protects your transactions. Click below to
        download MetaMask and set-up a MetaMask account. When you’re done, we’ll
        notify you to come back to Stream. (Try refreshing the page.)
      </div>
      <div className={commonStyles.navigation}>
        <BackButton />
        <StreamButton
          onClick={() => {
            chrome.tabs.create({ url: 'https://metamask.io' })
            props.push(Routes.WALLET_SETUP)
          }}
          primary
        >
          Download Metamask
        </StreamButton>
      </div>
    </div >
  )
}

const mapStateToProps = (state: RootState) => state
const mapDispatchToProps = (dispatch: Dispatch<RootState>) => bindActionCreators({ push }, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(MetamaskSetup)

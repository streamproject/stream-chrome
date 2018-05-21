import { BigNumber } from 'bignumber.js'
import * as classNames from 'classnames'
import * as _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { StrTokenUtils } from 'shared/dist/str'
import * as StrTokenActions from '../actions/StrTokenActions'
import * as commonStyles from '../components/__styles__/common.styl'
import { RootState } from '../reducers/RootReducer'
import * as styles from './__styles__/Wallet.styl'
import Header from './Header'
import TxHistory from './TxHistory'

const Warning = (props: { missingWeb3?: boolean, noAddress?: boolean, wrongAddress?: boolean }) => {
  let title: React.ReactNode = null
  let message: React.ReactNode = null
  if (props.missingWeb3) {
    title = 'Activate Metamask'
    message = (
    <span>
      Your Metamask Chrome extension is uninstalled. Log back in
      or <a href="https://metamask.io" target="_blank">download
      Metamask</a> to use this feature.
    </span>
    )
  } else if (props.noAddress) {
    title = 'Log in to Metamask'
    message = 'Your Metamask Chrome extension is logged-out.'
  } else if (props.wrongAddress) {
    title = 'Address mismatch'
    message = 'Your selected Metamask Chrome Extension address does not match your Stream account\'s address.'
  }

  return (
    <div className={styles.top}>
      <div className={classNames(commonStyles.container, styles.warningIconContainer)}>
        <i className={styles.warningIcon} />
      </div>
      <div className={commonStyles.title}>
        {title}
      </div>
      <div className={commonStyles.container}>
        {message}
      </div>
    </div>
  )
}

const Balance = (props: { balance: string }) => {
  const formattedBalance = StrTokenUtils.tweiToStr((new BigNumber(props.balance || 0))).toFormat(4)
  return (
    <div className={styles.top}>
      <div className={commonStyles.title}>
        Current Balance
      </div>
      <div className={classNames(commonStyles.container, styles.balance)}>
        {formattedBalance}
      </div>
      <div className={classNames(commonStyles.container, commonStyles.text, styles.balanceLabel)} >
        Stream Tokens (STR)
      </div>
    </div>
  )
}

class Wallet extends React.Component<RootState & typeof StrTokenActions.actionCreators> {
  public render() {
    const noAddress = _(this.props.str.address).isEmpty()
    const wrongAddress = this.props.str.address !== this.props.api.address
    const missingWeb3 = !this.props.str.web3Exists
    const showWarning = missingWeb3 || noAddress || wrongAddress
    return (
      <div className={commonStyles.popup}>
        <Header menuEnabled showAccounts />
        {showWarning ?
          <Warning missingWeb3={missingWeb3} noAddress={noAddress} wrongAddress={wrongAddress} /> :
          <Balance balance={this.props.str.balance} />
        }
        {showWarning ? (
          <TxHistory
            className={styles.txHistory}
            {...this.props.str}
            txEvents={undefined}
            onClaimEscrow={this.props.claimEscrow}
          />
        ) : (
          <TxHistory
            className={styles.txHistory}
            {...this.props.str}
            onClaimEscrow={this.props.claimEscrow}
          />
        )}
      </div>
    )
  }
}

const mapStateToProps = (state: RootState) => state
const mapDispatchToProps = (dispatch: Dispatch<RootState>) =>
  bindActionCreators(StrTokenActions.actionCreators, dispatch)
export default connect(mapStateToProps, mapDispatchToProps)(Wallet)

import { BigNumber } from 'bignumber.js'
import * as classNames from 'classnames'
import * as _ from 'lodash'
import * as React from 'react'
import { List } from 'semantic-ui-react'
import { PlatformModels, TxModels } from 'shared/dist/models'
import { StrTokenUtils } from 'shared/dist/str'
import { EventLog } from 'web3/types'
import * as commonStyles from '../components/__styles__/common.styl'
import StreamButton from '../components/StreamButton'
import { State } from '../reducers/StrTokenReducer'
import * as styles from './__styles__/TxHistory.styl'

const formatAddress = (address: string) => {
  return `${address.substring(0, 8)}...`
}

type Tx = {
  txData: TxModels.TxResponse,
  eventLog?: EventLog,
}

const TxItem  = (props: { tx: Tx, isSender: boolean, onClaimEscrow: (txHash: string) => {} }) => {
  const { senderUsername, recipientUsername, senderAddress, recipientAddress,
    value, recipientPlatformType, txHash, txStatus, txType } = props.tx.txData

  const formattedValue = (
    <span className={styles.amount}>
      {StrTokenUtils.tweiToStr(new BigNumber(value)).toFormat(4)} STR
    </span>
  )

  const formattedFrom = senderUsername || formatAddress(senderAddress)
  const formattedTo = recipientUsername || formatAddress(recipientAddress)

  let txTitle = props.isSender ?
    <span>You sent {formattedValue} to {formattedTo} STR</span> :
    <span>{formattedFrom} sent you {formattedValue} STR</span>
  let txCaption = ''
  let txAction = (
    <a href={`https://ropsten.etherscan.io/tx/${txHash}`} target="_blank">
      View transaction details.
    </a>
  )

  if (txType === TxModels.PROMO_SLICE) {
    const isYoutube = recipientPlatformType === PlatformModels.YOUTUBE
    const isTwitch = recipientPlatformType === PlatformModels.TWITCH

    txTitle = <span>Stream sent you {formattedValue} STR</span>
    txCaption = `From the views your videos received ${(isYoutube && 'on Youtube') || (isTwitch && 'on Twitch')}`
  } else if (txType === TxModels.ESCROW && txStatus === TxModels.UNCLAIMED) {
    if (props.isSender) {
      txTitle = <span>You sent {formattedValue} STR to a content creator without a stream account.</span>
      txCaption = 'Your STR will be held in escrow until the content creator claims it'
    } else {
      txTitle = <span>{formattedFrom} wants to send you {formattedValue} STR</span>
      txAction = (
        <StreamButton
          onClick={() => props.onClaimEscrow(txHash)}
          primary
        >
          Claim your Stream tokens
        </StreamButton>
      )
    }
  }

  return (
    <List.Item>
      <div
        className={classNames(styles.txItem, {
          [styles.isSender]: props.isSender,
          [styles.pending]: txStatus === TxModels.PENDING,
        })}
      >
        <div className={styles.streamBadge}>
          <i className={styles.streamIcon} />
        </div>
        <div>
          <div className={classNames(commonStyles.text, styles.txTitle)}>
            {txTitle}
          </div>
          <div className={classNames(commonStyles.small, styles.txCaption)}>
            {txCaption}
          </div>
          <div className={classNames(commonStyles.small, styles.txAction)}>
            {txAction}
          </div>
        </div>
      </div>
    </List.Item>
  )
}

type TxHistoryProps = State & { className: string, onClaimEscrow: (txHash: string) => {} }

class TxHistory extends React.Component<TxHistoryProps, { txs: Tx[] }> {

  public state = {
    txs: [],
  }

  public processTxs() {
    let txEvents = {}
    if (this.props.txEvents) {
      txEvents = _(this.props.txEvents.to.concat(this.props.txEvents.from))
        .uniqBy((txEvent) => txEvent.transactionHash)
        .keyBy((txEvent) => txEvent.transactionHash)
        .value()
    }

    const txs = _(this.props.txData)
      .sortBy((tx) => tx.datetime)
      .reverse()
      .map((txData) => ({
        txData,
        eventLog: txEvents[txData.txHash],
      }))
      .value()

    // TODO(dli) Include txs that show up in txEvents but not txData?

    return txs
  }

  public renderTxItems() {
    const txs = this.processTxs()

    if (_(txs).isEmpty()) {
      return (
        <div className={classNames(styles.label, commonStyles.text)}>
          No Transactions
        </div>
      )
    }

    return (
      <div className={styles.txGroup}>
        <List>
          {txs.map((tx) => (
            <TxItem
              tx={tx}
              key={tx.txData.txHash}
              isSender={tx.txData.senderAddress === this.props.address}
              onClaimEscrow={this.props.onClaimEscrow}
            />
          ))}
        </List>
      </div>
    )
  }

  public render() {
    return (
      <div className={classNames(styles.txHistory, this.props.className)}>
        <div className={classNames(styles.label, commonStyles.text)}>
          Transaction History
        </div>
        {this.renderTxItems()}
      </div>
    )
  }
}

export default TxHistory

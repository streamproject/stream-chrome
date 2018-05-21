import { BigNumber } from 'bignumber.js'
import * as classNames from 'classnames'
import * as _ from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import 'semantic-ui-css/semantic.min.css'
import { Modal } from 'semantic-ui-react'
import * as Errors from 'shared/dist/models/Errors'
import { StrTokenUtils } from 'shared/dist/str'
import Web3 = require('web3')
import { fromInjectionMessageCreators as strTokenMessageCreators } from '../../actions/StrTokenActions'
import * as commonStyles from '../../components/__styles__/common.styl'
import AccountCicle from '../../components/AccountCircle'
import StreamButton from '../../components/StreamButton'
import TextField from '../../components/TextField'
import { EXTENSION_ID, STR_SIGNED_TRANSFER_EXPIRATION, STR_TOKEN_ADDRESS } from '../../constants/config'
import { injectionToContent } from '../../utils/ContentProxyUtils'
import * as MetamaskUtils from '../../utils/MetamaskUtils'
import { State as InjectionState } from '../InjectionReducer'
import * as styles from './__styles__/TipModalContent.styl'

let web3: Web3
let strToken: StrTokenUtils.ISTRTokenImplementation

export type TipModalContentProps = InjectionState
  & {
    channelName: string,
  }

export type TipModalContentState = {
  crxError: Errors.CrxErrors.ERRORS_TYPE,
  strError: Errors.TxErrors.ERRORS_TYPE,
  showModal: boolean,
  message: string,
  tipAmount: string,
  pendingTransaction: boolean,
  completedTransaction: boolean,
}

const initialState: TipModalContentState = {
  crxError: null,
  strError: null,
  showModal: false,
  message: '',
  tipAmount: '',
  pendingTransaction: false,
  completedTransaction: false,
}

const basicErrors = new Set([
  Errors.CrxErrors.STREAM_USER_MISSING,
  Errors.CrxErrors.NETWORK_ERROR,
  Errors.CrxErrors.METAMASK_OFF,
  Errors.CrxErrors.METAMASK_ACCOUNT_MISMATCH,
])

const strErrors = new Set([
  Errors.TxErrors.FROM_ADDRESS_MISSING,
  Errors.TxErrors.TO_ADDRESS_MISSING,
  Errors.TxErrors.TRANSFER_FAILED,
  Errors.TxErrors.INSUFFICIENT_FUNDS,
  Errors.TxErrors.INVALID_AMOUNT,
])

const BasicError = (props: { error: Errors.CrxErrors.ERRORS_TYPE }) => (
  <Modal.Content className={styles.basicError}>
    <img
      className={styles.streamLogoHeader}
      src={`chrome-extension://${EXTENSION_ID}/static/logo_text.svg`}
    />
    <img
      className={styles.modalError}
      src={`chrome-extension://${EXTENSION_ID}/static/ic_error.svg`}
    />
    <p className={classNames(commonStyles.text, styles.message)}>
      {Errors.humanize(props.error)}
    </p>
  </Modal.Content>
)

const PendingTransaction = () => (
  <div className={styles.pendingTransaction}>
    <img
      className={styles.streamLogoHeader}
      src={`chrome-extension://${EXTENSION_ID}/static/logo_text.svg`}
    />
    <div className={styles.column}>
      <img
        className={styles.loadingIcon}
        src={`chrome-extension://${EXTENSION_ID}/static/ic-data-usage.svg`}
      />
      <p className={classNames(styles.message, commonStyles.h2)}>
        Transaction pending...
        <br />
        Please confirm your transaction details on Metamask!
      </p>
    </div>
  </div>
)

// This isn't actually "completed", it's just been requested.
const CompletedTransaction = (props: { channelName: string, tipAmount: string }) => (
  <Modal.Content className={styles.completed}>
    <img
      className={styles.streamLogoHeader}
      src={`chrome-extension://${EXTENSION_ID}/static/logo_text.svg`}
    />
    <p className={classNames(styles.message, commonStyles.h2)}>
      You just sent {props.channelName} {props.tipAmount} Stream Tokens!
    </p>
    <img
      className={styles.grinning}
      src={`chrome-extension://${EXTENSION_ID}/static/grinning.png`}
    />
  </Modal.Content>

)

class TipModalContent extends React.Component<TipModalContentProps, TipModalContentState> {
  public state = { ...initialState }

  public async getCrxErrorsFromProps(props: TipModalContentProps) {
    if (!props.currentUser.id) {
      return Errors.CrxErrors.STREAM_USER_MISSING
    }

    if (!web3) {
      return Errors.CrxErrors.METAMASK_OFF
    }

    const accounts = await web3.eth.getAccounts()
    if (_(accounts).isEmpty()) {
      return Errors.CrxErrors.METAMASK_ACCOUNT_MISMATCH
    }

    if (!props.currentUser.address || props.currentUser.address !== accounts[0]) {
      return Errors.CrxErrors.METAMASK_ACCOUNT_MISMATCH
    }

    return null
  }

  public componentDidMount() {
    this.getCrxErrorsFromProps(this.props)
      .then((crxError) => {
        this.setState({
          crxError,
        })
      })

    try {
      web3 = MetamaskUtils.getMetaMaskWeb3()
      strToken = StrTokenUtils.getStrToken(web3, STR_TOKEN_ADDRESS)
    } catch (error) {
      if (error.message) {
        this.setState({ crxError: error.message })
      }
    }
  }

  public componentWillReceiveProps(nextProps: TipModalContentProps) {
    this.getCrxErrorsFromProps(nextProps)
      .then((crxError) => {
        this.setState({
          crxError,
        })
      })
  }

  public handleSendStr = async () => {
    const value = StrTokenUtils.strToTwei(new BigNumber(this.state.tipAmount))
    const availableBalance = await strToken.methods.balanceOf(this.props.currentUser.address).call()

    if (!StrTokenUtils.isValidTwei(value)) {
      return this.setState({ strError: Errors.TxErrors.INVALID_AMOUNT })
    }

    if (value.greaterThanOrEqualTo(availableBalance)) {
      return this.setState({ strError: Errors.TxErrors.INSUFFICIENT_FUNDS })
    }

    this.setState({ pendingTransaction: true })

    try {
      const nonce = await StrTokenUtils.getNonce(web3, strToken, this.props.currentUser.address)
      const expiration = new BigNumber(Date.now() + STR_SIGNED_TRANSFER_EXPIRATION)

      const signableTransfer = await strToken.methods.getSignableTransfer(
        this.props.currentUser.address,
        this.props.platformUser.address,
        value,
        expiration,
        nonce,
      ).call()

      const signedTransfer = await web3.eth.sign(signableTransfer, this.props.currentUser.address)

      injectionToContent(strTokenMessageCreators.send(
        signedTransfer,
        this.props.platformUser.id,
        value,
        expiration,
        nonce,
        this.state.message,
      ))

      this.setState({ completedTransaction: true, pendingTransaction: false })
    } catch {
      this.setState({ pendingTransaction: false })
    }
 }

  public render() {
    if (this.state.crxError && basicErrors.has(this.state.crxError)) {
      return <BasicError error={this.state.crxError} />
    }

    if (this.state.completedTransaction) {
      return <CompletedTransaction channelName={this.props.channelName} tipAmount={this.state.tipAmount} />
    }

    return this.renderTipForm()
  }

  public renderTipForm() {
    const isValid = !strErrors.has(this.state.strError)

    // the humanized error message may contain markup
    const errorMessage = <span dangerouslySetInnerHTML={{ __html: Errors.humanize(this.state.strError) }} />

    return (
      <Modal.Content>
        {this.state.pendingTransaction ?
          <PendingTransaction /> :
          <img
            className={styles.streamLogoHeader}
            src={`chrome-extension://${EXTENSION_ID}/static/logo_text_white.svg`}
          />
        }
        <div className={styles.banner} />
        <div className={styles.accountCircleContainer} >
          <AccountCicle
            photoSrc={`chrome-extension://${EXTENSION_ID}/static/supporter.png`}
            size="80px"
            thickBorder
          />
        </div>
        <p className={classNames(styles.message, commonStyles.h2)}>
          Support <strong>{this.props.channelName}</strong>
          <br />
          with Stream Token!
        </p>
        <div className={styles.card}>
          <TextField
            fluid
            directions="Amount to send"
            placeholder="0"
            type="number"
            value={this.state.tipAmount}
            onChange={(event, data) => {this.setState({ tipAmount: data.value })}}
            showValidation
            isValid={isValid}
            onTypingDone={(event, data) => {this.setState({ strError: null })}}
            rightLabel="STR"
          />
          {errorMessage && <div className={styles.strErrorMessage}>{errorMessage}</div>}
          <TextField
            fluid
            className={styles.messageField}
            directions="Add a short message (optional)"
            placeholder=""
            type="text"
            value={this.state.message}
            onChange={(event, data) => {this.setState({ message: data.value })}}
          />
          <StreamButton
            className={styles.streamButton}
            onClick={this.handleSendStr}
            primary
          >
            Send Stream Tokens
          </StreamButton>
        </div>
      </Modal.Content>
    )
  }
}

const mapStateToProps = (state: InjectionState) => state
export default connect(mapStateToProps)(TipModalContent)

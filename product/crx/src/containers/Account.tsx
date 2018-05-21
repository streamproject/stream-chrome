import * as classNames from 'classnames'
import * as React from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { push } from 'react-router-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { Divider } from 'semantic-ui-react'
import { actionCreators as authApiActionCreators } from '../actions/AuthApiActions'
import { actionCreators as platformApiActionCreators } from '../actions/PlatformApiActions'
import * as commonStyles from '../components/__styles__/common.styl'
import AccountCircle from '../components/AccountCircle'
import * as Routes from '../constants/routes'
import { RootState } from '../reducers/RootReducer'
import * as styles from './__styles__/Account.styl'
import { TwitchConnect, YoutubeConnect } from './ConnectPlatforms'
import Header from './Header'

type AccountProps = RootState & typeof authApiActionCreators & typeof platformApiActionCreators & { push: typeof push }

const AccountRow = (props: { label: string, value: React.ReactNode, onClick?: () => {} }) => (
  <div className={classNames(commonStyles.container, styles.row)}>
    <div className={styles.label}>
      {props.label}
    </div>
    <div className={styles.value}>
      {props.value}
    </div>
    {props.onClick && <a className={styles.editIcon} onClick={() => props.onClick()} />}
  </div>
)

class Account extends React.Component<AccountProps> {

  public render() {
    const setupWalletLink = (
      <Link to={Routes.WALLET_SETUP} className={commonStyles.linkUnderline}>
        Set up your wallet
      </Link>
    )
    return (
      <div className={commonStyles.popup} >
        <Header hideLogo showBack />

        <div className={styles.accountCircleContainer}>
          <AccountCircle className={styles.accountCircle} photoSrc={this.props.api.profPic} size="96px" />
        </div>

        <div className={classNames(commonStyles.text, styles.table)}>
          <AccountRow label="Username" value={this.props.api.username} />
          <Divider />
          <AccountRow label="Email" value={this.props.api.email} />
          <Divider />
          <AccountRow
            label="ETH Address"
            value={ this.props.api.address ? this.props.api.address : setupWalletLink }
            onClick={() => this.props.push(Routes.UPDATE_ADDRESS)} // TODO does this route to the link or the onClick?
          />
        </div>

        <Divider />

        <div className={commonStyles.container}>
          <div className={classNames(commonStyles.text, styles.connectedAccountsLabel)}>
            Connected Accounts
          </div>
          <YoutubeConnect {...this.props} connectPlatform={this.props.connectPlatform} />
          <TwitchConnect {...this.props} connectPlatform={this.props.connectPlatform} />
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state: RootState) => state
const mapDispatchToProps = (dispatch: Dispatch<RootState>) =>
  bindActionCreators({ ...authApiActionCreators, ...platformApiActionCreators, push }, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Account)

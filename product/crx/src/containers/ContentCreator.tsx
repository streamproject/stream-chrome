import * as classNames from 'classnames'
import * as React from 'react'
import { connect } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router'
import { Link } from 'react-router-dom'
import { push } from 'react-router-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { actionCreators as platformApiActionCreators } from '../actions/PlatformApiActions'
import * as commonStyles from '../components/__styles__/common.styl'
import Footer from '../components/Footer'
import StreamButton from '../components/StreamButton'
import * as Routes from '../constants/routes'
import { RootState } from '../reducers/RootReducer'
import * as styles from './__styles__/ContentCreator.styl'
import { TwitchConnect, YoutubeConnect } from './ConnectPlatforms'

type ContentCreatorProps = RootState
  & RouteComponentProps<any>
  & typeof platformApiActionCreators
  & { push: typeof push }

const ContentCreator = (props: ContentCreatorProps) => (
  <div className={commonStyles.popup}>
    <div className={styles.bannerContainer}>
      <div className={styles.banner} />
    </div>
    <div className={commonStyles.title}>Are you a content creator?</div>
    <div className={commonStyles.container}>
      <YoutubeConnect {...props} connectPlatform={props.connectPlatform} />
      <TwitchConnect {...props} connectPlatform={props.connectPlatform} />
    </div>
    <div className={classNames(commonStyles.container, commonStyles.text)}>
      <StreamButton
        onClick={() => props.push(Routes.WALLET_SETUP)}
        fluid
        primary
      >
        Next
      </StreamButton>
    </div>
    <Footer>
      <div>{'Not a content creator? '}<Link to={Routes.WALLET_SETUP}>Skip this step</Link></div>
    </Footer>
  </div >
)

const mapStateToProps = (state: RootState) => state
const mapDispatchToProps = (dispatch: Dispatch<RootState>) => bindActionCreators(
  { push, ...platformApiActionCreators }, dispatch)

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ContentCreator))

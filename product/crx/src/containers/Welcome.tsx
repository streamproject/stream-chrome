import * as classNames from 'classnames'
import * as React from 'react'
import { connect } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router'
import { push } from 'react-router-redux'
import { bindActionCreators, Dispatch } from 'redux'
import * as commonStyles from '../components/__styles__/common.styl'
import StreamButton from '../components/StreamButton'
import * as Routes from '../constants/routes'
import { RootState } from '../reducers/RootReducer'
import * as styles from './__styles__/Welcome.styl'

const Welcome = (props: RootState & RouteComponentProps<any> & { push: typeof push }) => (
  <div className={commonStyles.popup}>
    <div className={styles.bannerContainer}>
      <div className={styles.banner} />
    </div>
    <div className={commonStyles.title}>Welcome {props.api.username}</div>
    <div className={classNames(commonStyles.container, commonStyles.text, styles.text)}>
      You’re now a verified Stream user! From now on, you’ll be economically
      supporting your favorite content creators, at no cost to you, by just
      by viewing and upvoting their videos on YouTube and Twitch.
    </div>
    <div className={classNames(commonStyles.container, commonStyles.text)}>
      <StreamButton
        onClick={() => props.push(Routes.CONTENT_CREATOR)}
        fluid
        primary
      >
        Next
      </StreamButton>
    </div>
  </div >
)

const mapStateToProps = (state: RootState) => state
const mapDispatchToProps = (dispatch: Dispatch<RootState>) => bindActionCreators({ push }, dispatch)

export default withRouter(connect<any, any, any>(mapStateToProps, mapDispatchToProps)(Welcome))

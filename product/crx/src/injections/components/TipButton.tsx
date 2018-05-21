import * as classNames from 'classnames'
import * as React from 'react'
import { connect } from 'react-redux'
import 'semantic-ui-css/semantic.min.css'
import { Modal } from 'semantic-ui-react'
import { UserModels } from 'shared/dist/models/'
import * as globalStyles from '../../components/__styles__/global.styl'
import StreamButton from '../../components/StreamButton'
import { EXTENSION_ID } from '../../constants/config'
import { State as InjectionState } from '../InjectionReducer'
import * as styles from './__styles__/TipButton.styl'
import TipModalContent from './TipModalContent'

export type TipButtonProps = InjectionState & {
  channelName: string,
}

export type TipButtonState = {
  showModal: boolean,
}

const initialState: TipButtonState = {
  showModal: false,
}

class TipButtonTrigger extends React.Component<{ onClick: () => void, platformUser: UserModels.UserResponse } > {

  public render() {
    return (
      <StreamButton
        onClick={this.props.onClick}
        className={styles.button}
      >
        <img className={styles.logoIcon} src={`chrome-extension://${EXTENSION_ID}/static/logo.svg`} />
        <div className={styles.label}>Send Stream Tokens</div>
      </StreamButton>
    )
  }
}

class TipButton extends React.Component<TipButtonProps, TipButtonState> {
  public state = { ...initialState }

  public render() {
    return (
      <div className="stream-crx">
        <Modal
          className={classNames(globalStyles.global, 'stream-crx')}
          size="mini"
          open={this.state.showModal}
          closeIcon={
            <img
              className={styles.closeIcon}
              src={`chrome-extension://${EXTENSION_ID}/static/close.svg`}
            />
          }
          onClose={() => this.setState({ showModal: false })}
          trigger={
            <TipButtonTrigger
              onClick={() => { this.setState({ showModal: true })}}
              platformUser={this.props.platformUser}
            />
          }
        >
          <TipModalContent channelName={this.props.channelName} />
        </Modal>
      </div>
    )
  }
}

const mapStateToProps = (state: InjectionState) => state
export default connect(mapStateToProps)(TipButton)

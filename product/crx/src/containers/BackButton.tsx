import * as React from 'react'
import { connect } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router'
import { push } from 'react-router-redux'
import { bindActionCreators, Dispatch } from 'redux'
import StreamButton from '../components/StreamButton'
import * as Routes from '../constants/routes'
import { RootState } from '../reducers/RootReducer'

type BackButtonProps = RouteComponentProps<any>
  & {
    push: typeof push,
    customLabel?: string,
    onClick: () => {},
  }

const BackButton = (props: BackButtonProps) => {

  const clickHandler = () => {
    if (props.onClick) {
      props.onClick()
    } else if (props.history.length < 2) {
      props.push(Routes.WALLET)
    } else {
      props.history.goBack()
    }
  }

  return (
    <StreamButton
      onClick={clickHandler}
      secondary
      type="button"
    >
      {props.customLabel || 'Back'}
    </StreamButton>
  )
}

const mapDispatchToProps = (dispatch: Dispatch<RootState>) => bindActionCreators({ push }, dispatch)

export default withRouter(connect<any, any, any>(null, mapDispatchToProps)(BackButton))

import * as React from 'react'
import { connect } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router'
import { push } from 'react-router-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { actionCreators as userApiActionCreators } from '../actions/UserApiActions'
import { actionCreators as viewsActionCreators } from '../actions/ViewsActions'
import * as commonStyles from '../components/__styles__/common.styl'
// import Footer from '../components/Footer'
import { RootState } from '../reducers/RootReducer'
import * as ProfilePhotoStyles from './__styles__/ProfilePhoto.styl'
import Header from './Header'

type ProfilePhotoProps = RootState
  & typeof userApiActionCreators
  & typeof viewsActionCreators
  & RouteComponentProps<any>
  & { push: typeof push }

type ProfilePhotoState = { selectedProfilePhotoUrl: string }

class ProfilePhoto extends React.Component<ProfilePhotoProps, ProfilePhotoState> {
  public state: ProfilePhotoState = {
    selectedProfilePhotoUrl: null,
  }

  public handleFile = (event: React.ChangeEvent<any>) => {
    event.preventDefault()
    const file = (event.target as HTMLInputElement).files[0]

    this.setState({
      // TODO(dli): cleanup URL created object
      selectedProfilePhotoUrl: URL.createObjectURL(file),
    })
  }

  public render() {
    const profilePictureUrl = this.state.selectedProfilePhotoUrl || this.props.api.profPic
    return (
      <div className={commonStyles.popup} >
        <Header/>
        <div className={commonStyles.title}>Upload a Profile Photo</div>
        <div className={commonStyles.row}>
          <label htmlFor="upload" className={ProfilePhotoStyles.photoContainer}>
            <input id="upload" type="file" onChange={this.handleFile} className={ProfilePhotoStyles.uploadButton} />
            <div className={ProfilePhotoStyles.previewContainer}>
              {profilePictureUrl ?
                <img className={ProfilePhotoStyles.photo} src={profilePictureUrl} />
                :
                <i className={ProfilePhotoStyles.cameraIcon} />}
            </div>
          </label>
        </div>
        {/* <Footer
          submitText="Save"
          onSubmit={() => this.props.updateUser({ profilePhotoObjectUrl: this.state.selectedProfilePhotoUrl })}

          linkText="Skip for now."
          onLinkClick={() => this.props.push(Routes.METAMASK_SETUP)}
        /> */}
      </div>
    )
  }
}

const mapStateToProps = (state: RootState) => state

const mapDispatchToProps = (dispatch: Dispatch<RootState>) => bindActionCreators({
  ...userApiActionCreators,
  ...viewsActionCreators,
  push,
}, dispatch)

export default withRouter(connect<any, any, any>(mapStateToProps, mapDispatchToProps)(ProfilePhoto))

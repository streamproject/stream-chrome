import * as classNames from 'classnames'
import * as React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators, Dispatch } from 'redux'
import { actionCreators as authApiActionCreators } from '../actions/AuthApiActions'
import * as commonStyles from '../components/__styles__/common.styl'
import Footer from '../components/Footer'
import StreamButton from '../components/StreamButton'
import { RootState } from '../reducers/RootReducer'
import TermsAndConditionsCopy from '../utils/TermsAndConditionsCopy'
import * as styles from './__styles__/Terms.styl'
import BackButton from './BackButton'
import Header from './Header'

type TermsProps = RootState
  & typeof authApiActionCreators

type TermsState = {
  bottomOfTerms: boolean,
}

class Terms extends React.Component<TermsProps, TermsState> {
  private termsContainer: HTMLElement

  constructor(props) {
    super(props)

    this.state = {
      bottomOfTerms: false,
    }
  }

  public componentDidMount() {
    this.termsContainer.addEventListener('scroll', () => {
      const bottomOfTerms = (this.termsContainer.scrollHeight -
        this.termsContainer.scrollTop - this.termsContainer.clientHeight) < 100

      this.setState({
        bottomOfTerms,
      })
    })
  }

  public render() {
    return (
      <div className={commonStyles.popup}>
        <Header />
        <div className={commonStyles.title}>
          Terms of Service
        </div>
        <div
          className={classNames(commonStyles.container, styles.termsContainer)}
          ref={(termsContainer) => this.termsContainer = termsContainer}
        >
          {TermsAndConditionsCopy}
        </div>
        <div className={commonStyles.navigation}>
          <BackButton />
          <StreamButton
            onClick={() => this.props.signup({
              email: this.props.views.email,
              username: this.props.views.username,
              password: this.props.views.password,
              referrerCode: this.props.views.referrerCode,
            })}
            primary
            disabled={!this.state.bottomOfTerms}
          >
            Sign Up
          </StreamButton>
        </div>
        <Footer>
          <div>By signing up, I agree to the Terms of Service</div>
        </Footer>
      </div>
    )
  }
}

const mapStateToProps = (state: RootState) => state
const mapDispatchToProps = (dispatch: Dispatch<RootState>) => bindActionCreators(authApiActionCreators, dispatch)
export default connect(mapStateToProps, mapDispatchToProps)(Terms)

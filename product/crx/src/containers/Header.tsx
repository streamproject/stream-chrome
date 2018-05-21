import * as classNames from 'classnames'
import * as React from 'react'
import { connect } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router'
import { Link } from 'react-router-dom'
import { bindActionCreators, Dispatch } from 'redux'
import { Dropdown } from 'semantic-ui-react'
import { actionCreators as authApiActionCreators } from '../actions/AuthApiActions'
import * as commonStyles from '../components/__styles__/common.styl'
import * as Routes from '../constants/routes'
import { RootState } from '../reducers/RootReducer'
import * as styles from './__styles__/Header.styl'

const Menu = (props: { logout: () => {} }) => (
  <Dropdown icon={<img src="/static/menu_light.svg" className={styles.menuIconLight} />} defaultOpen={false}>
    <Dropdown.Menu className={styles.dropdownContainer}>
      <div className={styles.dropdownItem}>
        <img src="/static/menu_dark.svg" />
      </div>
      <Dropdown.Divider className={styles.divider} />
      <a className={styles.dropdownItem} href="https://streamtoken.net/" target="_blank">About Stream</a>
      <Dropdown.Divider className={styles.divider} />
      <a className={styles.dropdownItem} href="https://streamtoken.net/extension-help" target="_blank">Help & Feedback</a>
      <Dropdown.Divider className={styles.divider} />
      <a className={styles.dropdownItem} href="https://streamtoken.typeform.com/to/zG642l" target="_blank">Earn STR</a>
      <Dropdown.Divider className={styles.divider} />
      <a className={styles.dropdownItem} onClick={() => props.logout()}>
        Logout
      </a>
      <Dropdown.Divider className={styles.divider} />
      <div className={styles.logoTextContainer}>
        <i className={styles.logoText} />
      </div>
    </Dropdown.Menu>
  </Dropdown>
)

type HeaderProps = RouteComponentProps<any> & RootState & {
  menuEnabled?: boolean,
  showAccounts?: boolean,
  showBack?: boolean
  large?: boolean,
  className?: string,
  hideLogo?: boolean,
  title?: string,
}

const Header = (props: HeaderProps & typeof authApiActionCreators) => {
  let title = null
  if (props.title != null) {
    title = (
      <div className={styles.headerTitle}>
        {props.title}
      </div>
    )
  }
  return (
    <div className={classNames(props.className, styles.header, {
      [styles.large]: props.large,
    })}>
      <div className={styles.left}>
        {props.showBack ? (
            <Link to={Routes.WALLET}>
              <i className={styles.back} />
            </Link>
          ) : null
        }
        {props.menuEnabled ? <Menu logout={props.logout}/> : null }
      </div>
      <div className={styles.center}>
        <i className={classNames({
          [styles.logo]: !props.large,
          [styles.logoLarge]: props.large,
          [commonStyles.hide]: props.hideLogo,
        })} />
        {title}
      </div>
      <div className={styles.right}>
        {props.showAccounts ? (
          <Link to={Routes.MY_ACCOUNT}>
            <i className={styles.account} />
          </Link>
        ) : <div /> }
      </div>
    </div>
  )
}

const mapStateToProps = (state: RootState) => state
const mapDispatchToProps = (dispatch: Dispatch<RootState>) => bindActionCreators({ ...authApiActionCreators }, dispatch)
export default withRouter(connect<any, any, any>(mapStateToProps, mapDispatchToProps)(Header))

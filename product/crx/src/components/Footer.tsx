import * as classNames from 'classnames'
import * as React from 'react'
import * as commonStyles from './__styles__/common.styl'
import * as styles from './__styles__/Footer.styl'

type FooterProps = {
  className?: string,
  children?: React.ReactNode,
}

const Footer = (props: FooterProps) => (
  <div className={classNames(props.className, styles.footer, commonStyles.container)}>
    {props.children}
  </div>
)

export default Footer

import * as classNames from 'classnames'
import * as React from 'react'
import * as styles from './__styles__/AccountCircle.styl'

const AccountCircle = (props: {
  className?: string,
  photoSrc?: string,
  size: string,
  thickBorder?: boolean,
}) => {
  return (
    <div
      className={classNames(
        styles.accountPreview,
        props.className,
        { [styles.thickBorder]: props.thickBorder })
      }
      style={{
        width: props.size,
        height: props.size,
      }}
    >
      <img className={styles.photo} src={props.photoSrc || '/static/supporter.png'} />
    </div>
  )
}

export default AccountCircle

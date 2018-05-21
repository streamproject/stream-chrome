import * as classNames from 'classnames'
import * as React from 'react'
import { Button, ButtonProps } from 'semantic-ui-react'
import * as styles from './__styles__/StreamButton.styl'

export type StreamButtonProps = ButtonProps

const StreamButton = (props: StreamButtonProps) => (
  <Button
    fluid
    { ...props }
    className={classNames(props.className, styles.Button, {
      [styles.primary]: props.primary,
      [styles.secondary]: props.secondary,
      [styles.disabled]: props.disabled,
    })}
  />
)

export default StreamButton

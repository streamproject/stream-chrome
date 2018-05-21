import * as classNames from 'classnames'
import * as _ from 'lodash'
import * as React from 'react'
import { Input, InputProps } from 'semantic-ui-react'
import * as styles from './__styles__/TextField.styl'

export const TIMER_EXPIRATION_INTERVAL = 1000

export type TextFieldProps = InputProps & {
  nightMode?: boolean,
  inline?: boolean,
  directions?: string,
  showValidation?: boolean,
  onTypingDone?: Function,
  isValid?: boolean,
  errorMessage?: React.ReactNode,
  stealFocus?: boolean,
  leftLabel?: string,
  rightLabel?: string,
  controlledValue?: boolean,
}

export type TextFieldState = {
  isUserTyping: boolean,
}

class TextField extends React.Component<TextFieldProps, TextFieldState> {
  public input: HTMLInputElement

  private timer: number
  private _isMounted: boolean

  constructor(props) {
    super(props)

    this._isMounted = false
    this.state = {
      isUserTyping: false,
    }
  }

  public componentWillReceiveProps(nextProps) {
    if (nextProps.value === this.props.value) {
      return
    }

    window.clearTimeout(this.timer)
    this.setState({
      isUserTyping: true,
    })

    this.timer = window.setTimeout(this.onTimerExpire, TIMER_EXPIRATION_INTERVAL)
  }

  public componentWillUnmount() {
    this._isMounted = false

    if (this.timer) {
      window.clearTimeout(this.timer)
    }
  }

  public componentDidMount() {
    this._isMounted = true
    if (this.props.stealFocus) {
      this.input.focus()
    }
  }

  public render() {
    const { isValid, showValidation, nightMode, className, inline,
      directions, value, errorMessage, onTypingDone, stealFocus, leftLabel,
      rightLabel, controlledValue, ...inputProps } = this.props

    const enableErrors = !_(value).isEmpty() && !this.state.isUserTyping

    return (
      <div className={classNames(className, {
        [styles.error]: enableErrors && showValidation && !isValid,
        [styles.nightMode]: nightMode,
      })}>
        {directions && (
          <div className={styles.directions}>
            {directions}
          </div>
        )}
        <Input
          { ...inputProps }
          className={classNames(
            styles.textField,
            {
              [styles.populated]: !_(value).isEmpty(),
            },
          )}
          {...({
            [controlledValue ? 'value' : 'defaultValue']: value,
          })}
        >
          {
            leftLabel && <div className={styles.leftLabel}>{leftLabel}</div>
          }
          <input ref={(input) => this.input = input}/>
          {
            rightLabel && <div className={styles.rightLabel}>{rightLabel}</div>
          }
          {
            enableErrors && showValidation && (
              <i className={classNames({
                [styles.checkIcon]: isValid,
                [styles.errorIcon]: !isValid,
              })} />
            )
          }

        </Input>
        {
          enableErrors && showValidation && !isValid && errorMessage && (
            <div className={styles.errorMessage}>{errorMessage}</div>
          )
        }
      </div>
    )
  }

  private onTimerExpire = () => {
    if (!this._isMounted) {
      return
    }

    if (this.props.onTypingDone) {
      this.props.onTypingDone()
    }

    this.setState({
      isUserTyping: false,
    })
  }
}

export default TextField

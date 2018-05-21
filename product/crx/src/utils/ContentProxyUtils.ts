import { FromBackgroundMessages, FromInjectionMessages } from '../actions/RootActions'

export const INJECTION_TO_CONTENT  = 'INJECTION_TO_CONTENT'
export const CONTENT_TO_INJECTION = 'CONTENT_TO_INJECTION'

export interface WrappedMessage<Message> {
  messageType: typeof INJECTION_TO_CONTENT | typeof CONTENT_TO_INJECTION
  message: Message
}

export function contentToInjection(message: FromBackgroundMessages) {
  const wrappedMessage: WrappedMessage<typeof message> = {
    messageType: CONTENT_TO_INJECTION,
    message,
  }

  window.postMessage(wrappedMessage, '*')
}

export function injectionToContent(message: FromInjectionMessages) {
  const wrappedMessage: WrappedMessage<typeof message> = {
    messageType: INJECTION_TO_CONTENT,
    message,
  }

  window.postMessage(wrappedMessage, '*')
}

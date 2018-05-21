export const ADD_NEW_VIEW = 'ADD_NEW_VIEW'

export type FromInjectionMessages = {
  ADD_NEW_VIEW: {
    type: typeof ADD_NEW_VIEW,
  },
}

export const fromInjectionMessageCreators = {
  addNewView(): FromInjectionMessages[typeof ADD_NEW_VIEW] {
    return {
      type: ADD_NEW_VIEW,
    }
  },
}

import { Reducer } from 'redux'

export type State = {
}

export const initialState: State = {
}

// In the case of actions that control MM, forward them along, instead of modifying the state.
// TODO(dli): Add reducers to change the route if this is false
export const reducer: Reducer<State> = (
  state = initialState,
) => {
  return state
}

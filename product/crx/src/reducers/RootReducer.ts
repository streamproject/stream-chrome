import { routerReducer, RouterState } from 'react-router-redux'
import { combineReducers } from 'redux'
import myHistory from '../myHistory'
import { initialState as initialApiState, reducer as ApiReducer, State as ApiState } from './ApiReducers'
import { initialState as initialStrTokenState, reducer as StrTokenReducer,
  State as StrTokenState } from './StrTokenReducer'
import { initialState as initialTrackingState, reducer as TrackingReducer,
  State as TrackingState } from './TrackingReducer'
import { initialState as initialAccountState, reducer as ViewsReducer, State as ViewsState } from './ViewsReducer'

export type RootState = {
  router: RouterState,
  api: ApiState,
  views: ViewsState,
  tracking: TrackingState,
  str: StrTokenState,
}

export const initialRootState: RootState = {
  router: { location: myHistory.location },
  api: initialApiState,
  views: initialAccountState,
  tracking: initialTrackingState,
  str: initialStrTokenState,
}

export const RootReducer = combineReducers<RootState>({
  router: routerReducer,
  api: ApiReducer,
  views: ViewsReducer,
  tracking: TrackingReducer,
  str: StrTokenReducer,
})

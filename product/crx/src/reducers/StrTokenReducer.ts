import { Reducer } from 'redux'
import { TxModels } from 'shared/dist/models'
import { EventLog } from 'web3/types'
import { Actions, FromInjectionMessages, GET_ALL_TXS_DATA_RESPONSE,
  GET_PROMO_STATUS_RESPONSE, UPDATE_TX_EVENTS, UPDATE_WALLET,
  UPDATE_WEB3_EXISTS } from '../actions/StrTokenActions'

export type State = {
  balance: string,
  address: string,
  promoRedeemed: boolean,
  web3Exists: boolean,
  txEvents: {
    from: EventLog[],
    to: EventLog[],
  },
  txData: TxModels.TxResponse[],
}

export const initialState: State = {
  balance: '0',
  address: '',
  promoRedeemed: false,
  web3Exists: false,
  txEvents: {
    from: null,
    to: null,
  },
  txData: [],
}

export const reducer: Reducer<State> = (
  state = initialState,
  action:
    | FromInjectionMessages[keyof FromInjectionMessages]
    | Actions[keyof Actions],
) => {
  switch (action.type) {
    case UPDATE_WALLET:
      return { ...state, address: action.address, balance: action.balance }

    case GET_PROMO_STATUS_RESPONSE:
      return { ...state, promoRedeemed: action.promoRedeemed }

    case UPDATE_WEB3_EXISTS:
      return { ...state, web3Exists: action.web3Exists }

    case UPDATE_TX_EVENTS:
      return { ...state, txEvents: action.txEvents }

    case GET_ALL_TXS_DATA_RESPONSE:
      return { ...state, txData: action.response }

    default:
      return state
  }
}

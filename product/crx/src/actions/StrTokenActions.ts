import { BigNumber } from 'bignumber.js'
import { Dispatch } from 'redux'
import { ThunkAction } from 'redux-thunk'
import { TxModels } from 'shared/dist/models'
import { EventLog } from 'web3/types'
import { RootState } from '../reducers/RootReducer'
import { txs as TxsApiUtils } from '../utils/ApiUtils'

export const GET_PROMO_STATUS_START = 'GET_PROMO_STATUS_START'
export const GET_PROMO_STATUS_RESPONSE = 'GET_PROMO_STATUS_RESPONSE'
export const REDEEM_PROMO = 'REDEEM_PROMO'
export const CLAIM_ESCROW = 'CLAIM_ESCROW'

export const GET_ALL_TXS_DATA = 'GET_ALL_TXS_DATA'
export const GET_ALL_TXS_DATA_RESPONSE = 'GET_ALL_TXS_DATA_RESPONSE'

export const SEND = 'SEND'
export const SEND_RESPONSE = 'SEND_RESPONSE'

export const UPDATE_WALLET_REQUEST = 'UPDATE_WALLET_REQUEST'
export const UPDATE_WALLET = 'UPDATE_WALLET'

export const UPDATE_TX_EVENTS = 'UPDATE_TX_EVENTS'

export const UPDATE_WEB3_EXISTS = 'UPDATE_WEB3_EXISTS'

export type Actions = {
  GET_PROMO_STATUS_START: {
    type: typeof GET_PROMO_STATUS_START,
  },

  GET_PROMO_STATUS_RESPONSE: {
    type: typeof GET_PROMO_STATUS_RESPONSE,
    promoRedeemed: boolean,
  },

  REDEEM_PROMO: {
    type: typeof REDEEM_PROMO,
  },

  GET_ALL_TXS_DATA: {
    type: typeof GET_ALL_TXS_DATA,
  }

  GET_ALL_TXS_DATA_RESPONSE: {
    type: typeof GET_ALL_TXS_DATA_RESPONSE,
    response: TxModels.TxResponse[],
  },

  CLAIM_ESCROW: {
    type: typeof CLAIM_ESCROW,
    txHash: string,
  },
}

export const actionCreators = {
  getPromoStatus(): Actions[typeof GET_PROMO_STATUS_START] {
    return {
      type: GET_PROMO_STATUS_START,
    }
  },

  redeemPromo(): Actions[typeof REDEEM_PROMO] {
    return {
      type: REDEEM_PROMO,
    }
  },

  getAllTxsData(): Actions[typeof GET_ALL_TXS_DATA] {
    return {
      type: GET_ALL_TXS_DATA,
    }
  },

  claimEscrow(txHash: string): Actions[typeof CLAIM_ESCROW] {
    return {
      type: CLAIM_ESCROW,
      txHash,
    }
  },
}

export const asyncActionCreators = {
  getPromoStatus(
    action: Actions[typeof GET_PROMO_STATUS_START],
  ): ThunkAction< void, RootState, void> {
    return async (dispatch: Dispatch<RootState>, getState: () => RootState) => {
      let response
      try {
        response = await TxsApiUtils.getPromoStatus()
      } catch (error) {
        // TODO
        throw error
      }

      const nextAction: Actions[typeof GET_PROMO_STATUS_RESPONSE] = {
        type: GET_PROMO_STATUS_RESPONSE,
        promoRedeemed: response.data,
      }

      dispatch(nextAction)
    }
  },

  redeemPromo(
    action: Actions[typeof REDEEM_PROMO],
  ): ThunkAction<void, RootState, void> {
    return async (dispatch: Dispatch<RootState>, getState: () => RootState) => {
      try {
        const response = await TxsApiUtils.redeemPromo()
        const nextAction: Actions[typeof GET_PROMO_STATUS_RESPONSE] = {
          type: GET_PROMO_STATUS_RESPONSE,
          promoRedeemed: response.data,
        }

        dispatch(nextAction)
      } catch (error) {
        throw error
      }

   }
  },

  getAllTxsData(
    action: Actions[typeof GET_ALL_TXS_DATA],
  ): ThunkAction<void, RootState, void> {
    return async (dispatch: Dispatch<RootState>, getState: () => RootState) => {
      try {
        const response = await TxsApiUtils.getAllTxs()
        const nextAction: Actions[typeof GET_ALL_TXS_DATA_RESPONSE] = {
          type: GET_ALL_TXS_DATA_RESPONSE,
          response: response.data,
        }
        dispatch(nextAction)
      } catch (error) {
        throw error
      }
    }
  },

  claimEscrow(
    action: Actions[typeof CLAIM_ESCROW],
  ): ThunkAction<void, RootState, void> {
    return async (dispatch: Dispatch<RootState>, getState: () => RootState) => {
      try {
        await TxsApiUtils.claimEscrow(action.txHash)

        dispatch(actionCreators.getAllTxsData())
      } catch (error) {
        throw error
      }
    }
  },
}

export const aliases = {
  [GET_PROMO_STATUS_START](action: Actions[typeof GET_PROMO_STATUS_START]) {
    return asyncActionCreators.getPromoStatus(action)
  },

  [REDEEM_PROMO](action: Actions[typeof REDEEM_PROMO]) {
    return asyncActionCreators.redeemPromo(action)
  },

  [GET_ALL_TXS_DATA](action: Actions[typeof GET_ALL_TXS_DATA]) {
    return asyncActionCreators.getAllTxsData(action)
  },

  [CLAIM_ESCROW](action: Actions[typeof CLAIM_ESCROW]) {
    return asyncActionCreators.claimEscrow(action)
  },
}

export type FromInjectionMessages = {
  SEND: {
    type: typeof SEND,
    signedTransfer: string,
    toUserId: string,
    value: string,
    expiration: string,
    nonce: string,
    message?: string,
  },

  UPDATE_WALLET: {
    type: typeof UPDATE_WALLET,
    address: string,
    balance: string,
  },

  UPDATE_WEB3_EXISTS: {
    type: typeof UPDATE_WEB3_EXISTS,
    web3Exists: boolean,
  },

  UPDATE_TX_EVENTS: {
    type: typeof UPDATE_TX_EVENTS,
    txEvents: {
      from: EventLog[],
      to: EventLog[],
    },
  },
}

export type FromBackgroundMessages = {
  SEND_RESPONSE: {
    type: typeof SEND_RESPONSE,
    signedTransferResponse: any,
  },

  UPDATE_WALLET_REQUEST: {
    type: typeof UPDATE_WALLET_REQUEST,
    address: string,
  },
}

export const fromInjectionMessageCreators = {
  send(
    signedTransfer: string,
    toUserId: string,
    value: BigNumber,
    expiration: BigNumber,
    nonce: BigNumber ,
    message?: string,
  ): FromInjectionMessages[typeof SEND] {
    return {
      type: SEND,
      signedTransfer,
      toUserId,
      value: value.toFixed(),
      expiration: expiration.toFixed(),
      nonce: nonce.toString(),
      message,
    }
  },

  updateWallet(address: string, balance: BigNumber): FromInjectionMessages[typeof UPDATE_WALLET] {
    return {
      type: UPDATE_WALLET,
      address,
      balance: balance && balance.toFixed(),
    }
  },

  updateWeb3Exists(web3Exists: boolean): FromInjectionMessages[typeof UPDATE_WEB3_EXISTS] {
    return {
      type: UPDATE_WEB3_EXISTS,
      web3Exists,
    }
  },

  updateTxEvents(fromTxs: EventLog[], toTxs: EventLog[]): FromInjectionMessages[typeof UPDATE_TX_EVENTS] {
    return {
      type: UPDATE_TX_EVENTS,
      txEvents: {
        from: fromTxs,
        to: toTxs,
      },
    }
  },
}

export const fromBackgroundMessageCreators = {
  // TODO: Use this instead of polling the wallet status.
  updateWalletRequest(address: string): FromBackgroundMessages[typeof UPDATE_WALLET_REQUEST] {
    return {
      type: UPDATE_WALLET_REQUEST,
      address,
    }
  },
}

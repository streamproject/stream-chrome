import axios from 'axios'
import * as  moxios from 'moxios'
import * as configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as StrTokenActions from '../../src/actions/StrTokenActions'
import { instance } from '../../src/utils/ApiUtils'
import { Meta } from '../../src/utils/SegmentUtils'
import { expect } from '../tools'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('3. Str Token actions', () => {
  describe('3.1 Action creators', () => {
    it('should create an action to get promo status', (done) => {
      const action = StrTokenActions.actionCreators.getPromoStatus()
      const expectedAction = {
        type: StrTokenActions.GET_PROMO_STATUS_START,
      }

      expect(action).to.be.deep.equal(expectedAction)
      done()
    })

    it('should create an action to redeem promo', (done) => {
      const action = StrTokenActions.actionCreators.redeemPromo()
      const expectedAction = {
        type: StrTokenActions.REDEEM_PROMO,
      }

      expect(action).to.be.deep.equal(expectedAction)
      done()
    })

    it('should create an action to get all txs data', (done) => {
      const action = StrTokenActions.actionCreators.getAllTxsData()
      const expectedAction = {
        type: StrTokenActions.GET_ALL_TXS_DATA,
      }

      expect(action).to.be.deep.equal(expectedAction)
      done()
    })

    it('should create an action to claim escrow', (done) => {
      const txHash = 'hash'
      const action = StrTokenActions.actionCreators.claimEscrow(txHash)
      const expectedAction = {
        type: StrTokenActions.CLAIM_ESCROW,
        txHash,
      }

      expect(action).to.be.deep.equal(expectedAction)
      done()
    })
  })

  describe('3.2 Async action creators', () => {
    afterEach(() => {
      moxios.uninstall(instance)
    })

    beforeEach(() => {
      moxios.install(instance)
    })

    it('should create an action to get Promo status', () => {
      moxios.wait(() => {
        const request = moxios.requests.mostRecent()

        request.respondWith({
          status: 200,
          response: { message: 'success', status: '200' },
        })
      })

      const expectedActions = [{
        type: StrTokenActions.GET_PROMO_STATUS_RESPONSE,
        promoRedeemed: { message: 'success', status: '200' },
      }]
      const store = mockStore({ api: { token: 'token' } })

      return store.dispatch(StrTokenActions.asyncActionCreators.getPromoStatus({
        type: StrTokenActions.GET_PROMO_STATUS_START,
      })).then(() => {
        expect(store.getActions()).to.be.deep.equal(expectedActions)
      })
    })

    it('should create an action to redeem promo', () => {
      moxios.wait(() => {
        const request = moxios.requests.mostRecent()

        request.respondWith({
          status: 200,
          response: { message: 'success', status: '200' },
        })
      })

      const action = StrTokenActions.REDEEM_PROMO
      const expectedActions = [{
        type: StrTokenActions.GET_PROMO_STATUS_RESPONSE,
        promoRedeemed: { message: 'success', status: '200' },
      }]
      const store = mockStore({ api: { token: 'token' } })

      return store.dispatch(StrTokenActions.asyncActionCreators.redeemPromo({
        type: StrTokenActions.REDEEM_PROMO,
      })).then(() => {
        expect(store.getActions()).to.be.deep.equal(expectedActions)
      })
    })

    it('should create an action to get txs data', () => {
      moxios.wait(() => {
        const request = moxios.requests.mostRecent()

        request.respondWith({
          status: 200,
          response: { message: 'success', status: '200' },
        })
      })

      const action = StrTokenActions.GET_ALL_TXS_DATA
      const expectedActions = [{
        type: StrTokenActions.GET_ALL_TXS_DATA_RESPONSE,
        response: { message: 'success', status: '200' },
      }]
      const store = mockStore({ api: { token: 'token' } })

      return store.dispatch(StrTokenActions.asyncActionCreators.getAllTxsData({
        type: StrTokenActions.GET_ALL_TXS_DATA,
      })).then(() => {
        expect(store.getActions()).to.be.deep.equal(expectedActions)
      })
    })

    it('should create an action to claim escrow', () => {
      moxios.wait(() => {
        const request = moxios.requests.mostRecent()

        request.respondWith({
          status: 200,
          response: { message: 'success', status: '200' },
        })
      })

      const action = StrTokenActions.CLAIM_ESCROW
      const expectedActions = [{ type: StrTokenActions.GET_ALL_TXS_DATA }]
      const store = mockStore({ api: { token: 'token' } })

      return store.dispatch(StrTokenActions.asyncActionCreators.claimEscrow({
        type: StrTokenActions.CLAIM_ESCROW,
        txHash: '',
      })).then(() => {
        expect(store.getActions()).to.be.deep.equal(expectedActions)
      })
    })
  })

  describe('3.3 Background message creators', () => {
    const action = StrTokenActions.fromBackgroundMessageCreators.updateWalletRequest('')
    const expectedAction = {
      type: StrTokenActions.UPDATE_WALLET_REQUEST,
      address: '',
    }

    expect(action).to.be.deep.equal(expectedAction)
  })
})

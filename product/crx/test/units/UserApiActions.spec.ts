import axios from 'axios'
import * as  moxios from 'moxios'
import * as configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import { Errors } from 'shared/dist/models'
import * as UserApiActions from '../../src/actions/UserApiActions'
import { instance } from '../../src/utils/ApiUtils'
import { expect } from '../tools'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('6. User api actions', () => {
  describe('6.1 Action creators', () => {
    it('should return an action to update users', (done) => {
      const action = UserApiActions.actionCreators.updateUser({ password: 'password' })
      const expectedAction = {
        type: UserApiActions.UPDATE_USER_START,
        password: 'password',
        nextRoute: undefined,
      }

      expect(action).to.be.deep.equal(expectedAction)
      done()
    })

    it('should return an action to verify phone', () => {
      const action = UserApiActions.actionCreators.verifyPhone({ nationalNumber: '123456789', countryCode: '123' })
      const expectedAction = {
        type: UserApiActions.VERIFY_START,
        nationalNumber: '123456789',
        countryCode: '123',
      }

      expect(action).to.be.deep.equal(expectedAction)
    })

    it('should return an action to check phone', () => {
      const action = UserApiActions.actionCreators.checkPhone({
        verificationCode: '12345',
        nationalNumber: '123456789',
        countryCode: '123',
      })
      const expectedAction = {
        type: UserApiActions.CHECK_START,
        verificationCode: '12345',
        nationalNumber: '123456789',
        countryCode: '123',
      }

      expect(action).to.be.deep.equal(expectedAction)
    })

    it('should return an action to set user error', () => {
      const userError = Errors.AuthErrors.INVALID_EMAIL
      const action = UserApiActions.actionCreators.setUserError(userError)
      const expectedAction = {
        type: 'USER_ERROR_RESPONSE',
        error: 'INVALID_EMAIL',
        meta: {
          analytics: {
            eventType: 'track',
            eventPayload: {
              event: 'USER_ERROR_RESPONSE',
              properties: {
                error: 'INVALID_EMAIL',
              },
            },
          },
        },
      }

      expect(action).to.be.deep.equal(expectedAction)
    })

    it('should return an action to reset', () => {
      const action = UserApiActions.actionCreators.reset()
      const expectedAction = { type: UserApiActions.USER_RESET }

      expect(action).to.be.deep.equal(expectedAction)
    })
  })

  describe('6.2 Async action creators', () => {
    afterEach(() => {
      moxios.uninstall(instance)
    })

    beforeEach(() => {
      moxios.install(instance)
    })

    it('should create an action to update a user', () => {
      moxios.wait(() => {
        const request = moxios.requests.mostRecent()

        request.respondWith({
          status: 200,
          response: { message: 'success', status: '200' },
        })
      })

      const expectedActions = [
        {
          type: 'UPDATE_USER_RESPONSE',
          response: {
            message: 'success',
            status: '200',
          },
          meta: {
            analytics: {
              eventType: 'track',
              eventPayload: {
                event: 'UPDATE_USER_RESPONSE',
                properties: {},
              },
            },
          },
        },
        {
          type: 'VIEWS_RESET',
        },
        {
          type: 'REDEEM_PROMO',
        },
      ]
      const store = mockStore({
         api: { token: 'token' },
         str: 'str',
        })

      return store.dispatch(UserApiActions.asyncActionCreators.updateUser({ password: 'pass' })).then(() => {
        expect(store.getActions()).to.be.deep.equal(expectedActions)
      })
    })

    it('should create an action to verify phone', () => {
      moxios.wait(() => {
        const request = moxios.requests.mostRecent()

        request.respondWith({
          status: 200,
          response: { message: 'success', status: '200' },
        })
      })

      const expectedActions = [{
        type: 'VERIFY_RESPONSE',
        verifyResponse: {
          message: 'success',
          status: '200',
        },
        meta: {
          analytics: {
            eventType: 'track',
            eventPayload: {
              event: 'VERIFY_RESPONSE',
              properties: {},
            },
          },
        },
      }]
      const store = mockStore({
        api: { token: 'token' },
        str: 'str',
      })
      const data = {
      nationalNumber: '123456789',
      countryCode: '40',
    }

      return store.dispatch(UserApiActions.asyncActionCreators.verifyPhone(data)).then(() => {
        expect(store.getActions()).to.be.deep.equal(expectedActions)
      })
    })

    it('should create an action to check phone', () => {
      moxios.wait(() => {
        const request = moxios.requests.mostRecent()

        request.respondWith({
          status: 200,
          response: { message: 'success', status: '200' },
        })
      })

      const expectedActions = [
        {
          type: 'CHECK_RESPONSE',
          checkResponse: {
            message: 'success',
            status: '200',
          },
          meta: {
            analytics: {
              eventType: 'track',
              eventPayload: {
                event: 'CHECK_RESPONSE',
                properties: {},
              },
            },
          },
        },
        {
          type: 'VIEWS_RESET',
        },
      ]
      const store = mockStore({
        api: { token: 'token' },
        str: 'str',
      })
      const data = {
        nationalNumber: '123456789',
        countryCode: '40',
        verificationCode: 'code',
      }
      return store.dispatch(UserApiActions.asyncActionCreators.checkPhone(data)).then(() => {
        expect(store.getActions()).to.be.deep.equal(expectedActions)
      })
    })
  })
})

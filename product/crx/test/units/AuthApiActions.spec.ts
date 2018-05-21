import axios from 'axios'
import * as  moxios from 'moxios'
import * as configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as AuthApiActions from '../../src/actions/AuthApiActions'
import { instance } from '../../src/utils/ApiUtils'
import { expect } from '../tools'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('1. Auth api actions', () => {
  describe('1.1. Action creators', () => {
    const user = {
      username: 'janeDoe',
      password: 'pass',
      email: 'jane.doe@email.com',
      referrerCode: null,
    }

    it('should create an action to login', (done) => {
      const expectedAction = {
        type: AuthApiActions.LOGIN_START,
        username: user.username,
        password: user.password,
      }
      const action = AuthApiActions.actionCreators.login({ username: user.username, password: user.password })

      expect(action).to.deep.equal(expectedAction)
      done()
    })

    it('should create an action to logout', (done) => {
      const expectedAction = {
        type: AuthApiActions.LOGOUT_START,
      }
      const action = AuthApiActions.actionCreators.logout()

      expect(action).to.deep.equal(expectedAction)
      done()
    })

    it('should create an action to signup', (done) => {
      const expectedAction = {
        type: AuthApiActions.SIGNUP_START,
        username: user.username,
        password: user.password,
        email: user.email,
        referrerCode: null,
      }
      const action = AuthApiActions.actionCreators.signup(user)

      expect(action).to.deep.equal(expectedAction)
      done()
    })

    it('should create an action to check signup', (done) => {
      const expectedAction = {
        type: AuthApiActions.CHECK_SIGNUP_START,
        username: user.username,
        password: user.password,
        email: user.email,
        referrerCode: null,
      }
      const action = AuthApiActions.actionCreators.checkSignup(user)

      expect(action).to.deep.equal(expectedAction)
      done()
    })

    it('should create an action to reset', (done) => {
      const action = AuthApiActions.actionCreators.reset()

      expect(action).to.deep.equal({ type: AuthApiActions.AUTH_RESET })
      done()
    })

    it('should create an action to set auth error', (done) => {
      const action = AuthApiActions.actionCreators.setAuthError('INVALID_EMAIL')
      const expectedAction = {
        type: AuthApiActions.AUTH_ERROR_RESPONSE,
        error: 'INVALID_EMAIL',
        meta: {
          analytics: {
            eventPayload: {
              event: 'AUTH_ERROR_RESPONSE',
              properties: {
                error: 'INVALID_EMAIL',
              },
            },
            eventType: 'track',
          },
        },
      }

      expect(action).to.deep.equal(expectedAction)
      done()
    })
  })

  describe('1.2. Async action creators', () => {
    afterEach(() => {
      moxios.uninstall(instance)
    })

    beforeEach(() => {
      moxios.install(instance)
      moxios.wait(() => {
        const request = moxios.requests.mostRecent()

        request.respondWith({
          status: 200,
          response: { message: 'success', status: '200' },
        })
      })
    })

    it('should create an action to login', async () => {
      const expectedActions = [
        { type: 'LOGIN_RESPONSE' },
        { type: 'GET_PLATFORMS' },
        { type: 'GET_PROMO_STATUS_START' },
        { type: 'VIEWS_RESET' },
        { type: 'GET_ALL_TXS_DATA' },
        { type: '@@router/CALL_HISTORY_METHOD' },
      ]
      const store = mockStore({})

      return store.dispatch(AuthApiActions.asyncActionCreators.login({
        type: AuthApiActions.LOGIN_START, username: 'test', password: 'test',
      })).then(() => {
        const actions = store.getActions()

        actions.forEach((action, index) => {
          expect(action).to.include(expectedActions[index])
        })
      })

    })

    it('should create an action to signup', async () => {
      const expectedActions = [
        { type: 'SIGNUP_RESPONSE' },
        { type: 'VIEWS_RESET' },
        { type: 'GET_PROMO_STATUS_START' },
        { type: 'GET_ALL_TXS_DATA' },
        { type: '@@router/CALL_HISTORY_METHOD' },
      ]
      const store = mockStore({})

      return store.dispatch(AuthApiActions.asyncActionCreators.signup({
        type: AuthApiActions.SIGNUP_START, username: 'test', password: 'test', email: 'test@email.com',
      })).then(() => {
        const actions = store.getActions()

        actions.forEach((action, index) => {
          expect(action).to.include(expectedActions[index])
        })
      })

    })

    it('should create an action to check logout', async () => {
      const expectedActions = [
        { type: 'LOGOUT_RESPONSE' },
        { type: 'AUTH_RESET' },
        { type: 'VIEWS_RESET' },
        { type: '@@router/CALL_HISTORY_METHOD' },
      ]
      const store = mockStore({ api: { token: 'token' } })

      return store.dispatch(AuthApiActions.asyncActionCreators.logout()).then(() => {
        const actions = store.getActions()

        actions.forEach((action, index) => {
          expect(action).to.include(expectedActions[index])
        })
      })
    })

    it('should create an action to check signup', async () => {
      const store = mockStore({})
      const expectedActions = []

      return store.dispatch(AuthApiActions.asyncActionCreators.checkSignup({
        type: AuthApiActions.CHECK_SIGNUP_START,
        username: 'janeDoe',
        password: 'password123',
        email: 'jane.doe@email.com',
      })).then(() => {
        expect(store.getActions().length).to.be.equal(0)
      })
    })

  })

  describe('1.3 From injection message creators', () => {
    it('should create an action to get auth redux state', (done) => {
      const action = AuthApiActions.fromInjectionMessageCreators.getAuthReduxState()
      const expectedAction = {
        type: AuthApiActions.GET_AUTH_REDUX_STATE,
      }

      expect(action).to.be.deep.equal(expectedAction)
      done()
    })
  })
})

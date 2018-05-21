import axios from 'axios'
import * as  moxios from 'moxios'
import * as configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as PlatformApiActions from '../../src/actions/PlatformApiActions'
import { formatMethod, platformApiInstance } from '../../src/actions/PlatformApiActions'
import { Meta } from '../../src/utils/SegmentUtils'
import { expect, Sinon } from '../tools'
import chrome from 'sinon-chrome'
const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)
import { format } from 'url'
import { BASE_URL, GOOGLE_CLIENT_ID, TWITCH_CLIENT_ID } from '../../src/constants/config'

describe('2. Platform api actions', () => {
  describe('1. Action creators', () => {
    it('should create an action to get platforms', () => {
      const action = PlatformApiActions.actionCreators.getPlatforms()

      expect(action.type).to.equal(PlatformApiActions.GET_PLATFORMS)
    })

    it('should create an action to connect to platform', () => {
      const action = PlatformApiActions.actionCreators.connectPlatform('YOUTUBE')

      expect(action.type).to.equal(PlatformApiActions.CONNECT_PLATFORM)
    })

    it('should create an action to delete platform', () => {
      const action = PlatformApiActions.actionCreators.deletePlatform('YOUTUBE')

      expect(action.type).to.equal(PlatformApiActions.DELETE_PLATFORM)
    })
  })

  describe('2. Async action creators', () => {
    beforeEach(() => {
      moxios.install(platformApiInstance)
      global.chrome = chrome
    })

    afterEach(() => {
      moxios.uninstall(platformApiInstance)
      chrome.flush()
      delete global.chrome
    })

    it('should create an action to get platforms', async () => {
      moxios.wait(() => {
        const request = moxios.requests.mostRecent()

        request.respondWith({
          status: 200,
          response: { data: 'TWITCH', status: '200' },
        })
      })

      const store = mockStore({ api: { token: 'token' } })
      const expectedActions = {
        type: PlatformApiActions.PLATFORMS_RESPONSE,
        platforms: { data: 'TWITCH', status: '200' },
        meta: null,
      }

      return store.dispatch(
        PlatformApiActions.asyncActionCreators.getPlatforms({ type: PlatformApiActions.GET_PLATFORMs, meta: null })
      ).then(() => {
        expect(store.getActions()[0]).to.be.deep.equal(expectedActions)
      })
    })

    it('should create an action to connect to platforms', async () => {
      const twitchUrl = format({
        protocol: 'https',
        host: 'api.twitch.tv/kraken/oauth2/authorize',
        query: {
          response_type: 'code',
          client_id: TWITCH_CLIENT_ID,
          redirect_uri: `https://${chrome.runtime.id}.chromiumapp.org/twitch_cb`,
          scope: 'openid user_read',
        },
      })

      chrome.identity.launchWebAuthFlow.withArgs({ url: twitchUrl, interactive: true }).yields('url.com')


      moxios.wait(() => {
        const request = moxios.requests.mostRecent()

        request.respondWith({
          status: 200,
          response: { data: 'TWITCH', status: '200' },
        })
      })

      const store = mockStore({ api: { token: 'token' } })
      const expectedAction = {
        type: 'PLATFORMS_RESPONSE',
        platforms: { data: 'TWITCH', status: '200' },
        meta: undefined,
      }

      return store.dispatch(
        PlatformApiActions.asyncActionCreators.connectPlatform({
          type: PlatformApiActions.CONNECT_PLATFORM,
          platform: 'TWITCH',
          meta: undefined,
        })).then(() => {
          expect(store.getActions()[0]).to.be.deep.equal(expectedAction)
        })
    })

    it('should return an action to delete platform', async () => {

      const store = mockStore({ api: { token: 'token' } })
      const expectedActions = {
        type: PlatformApiActions.GET_PLATFORMS,
        meta: undefined,
      }

      return store.dispatch(
        PlatformApiActions.asyncActionCreators.deletePlatform({
          type: PlatformApiActions.DELETE_PLATFORM,
          platformType: 'TWITCH',
          meta: null,
        })).then(() => {
        expect(store.getActions()[0]).to.be.deep.equal(expectedActions)
      })
    })
  })

})

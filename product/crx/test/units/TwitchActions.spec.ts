import axios from 'axios'
import * as  moxios from 'moxios'
import * as configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as TwitchActions from '../../src/actions/TwitchActions'
import { instance } from '../../src/utils/ApiUtils'
import { Meta } from '../../src/utils/SegmentUtils'
import { expect } from '../tools'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('5. Twitch actions', () => {
  describe('5.1 from injection message creators', () => {
    it ('should create an action to get twitch info', (done) => {
      const action = TwitchActions.fromInjectionMessageCreators.getTwitchInfo()
      const expectedAction = { type: 'GET_TWITCH_INFO' }

      expect(action).to.be.deep.equal(expectedAction)
      done()
    })
  })
})

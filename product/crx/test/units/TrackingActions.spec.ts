import axios from 'axios'
import * as  moxios from 'moxios'
import * as configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as TrackingActions from '../../src/actions/TrackingActions'
import { Meta } from '../../src/utils/SegmentUtils'
import { expect } from '../tools'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('4. Tracking actions', () => {
  describe('3.1 From injection message creators', () => {
    it('should return an add new view action', (done) => {
      const store = mockStore({})
      const expectedAction = { type: TrackingActions.ADD_NEW_VIEW }
      const action = TrackingActions.fromInjectionMessageCreators.addNewView()

      expect(action).to.be.deep.equal(expectedAction)
      done()
    })
  })
})

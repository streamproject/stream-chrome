import axios from 'axios'
import * as  moxios from 'moxios'
import * as configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as YoutubeActions from '../../src/actions/YoutubeActions'
import { Meta } from '../../src/utils/SegmentUtils'
import { expect } from '../tools'

const middlewares = [thunk]
const mockStore = configureMockStore(middlewares)

describe('8. Youtube actions', () => {
  describe('8.1 from injection message creators', () => {
    it('should create an action to get youtube info', (done) => {
      const action = YoutubeActions.fromInjectionMessageCreators.getYoutubeInfo()
      const expectedAction = { type: 'GET_YOUTUBE_INFO' }

      expect(action).to.be.deep.equal(expectedAction)
      done()
    })

  })
})

import * as ViewsActions from '../../src/actions/ViewsActions'
import { expect } from '../tools'

describe('7. Views actions', () => {
  describe('7.1 Action creators', () => {
    it('should create an action to set username', (done) => {
      const action = ViewsActions.actionCreators.setUsername('janeDoe')
      const expectedAction = {
        type: ViewsActions.SET_USERNAME,
        username: 'janeDoe',
      }

      expect(action).to.be.deep.equal(expectedAction)
      done()
    })

    it('should create an action to set email', (done) => {
      const action = ViewsActions.actionCreators.setEmail('jane.doe@email.com')
      const expectedAction = {
        type: ViewsActions.SET_EMAIL,
        email: 'jane.doe@email.com',
      }

      expect(action).to.be.deep.equal(expectedAction)
      done()
    })

    it('should create an action to set password', (done) => {
      const action = ViewsActions.actionCreators.setPassword('password123')
      const expectedAction = {
        type: ViewsActions.SET_PASSWORD,
        password: 'password123',
      }

      expect(action).to.be.deep.equal(expectedAction)
      done()
    })

    it('should create action to set referrer code', (done) => {
      const action = ViewsActions.actionCreators.setReferrerCode('code123')
      const expectedAction = {
        type: ViewsActions.SET_REFERRER_CODE,
        referrerCode: 'code123',
      }

      expect(action).to.be.deep.equal(expectedAction)
      done()
    })

    it('should create an action to set is new', (done) => {
      const action = ViewsActions.actionCreators.setIsNew(true)
      const expectedAction = {
        type: ViewsActions.SET_IS_NEW,
        isNew: true,
      }

      expect(action).to.be.deep.equal(expectedAction)
      done()
    })

    it('should create an action to set profile photo', (done) => {
      const action = ViewsActions.actionCreators.setProfilePhoto('url.com')
      const expectedAction = {
        type: ViewsActions.SET_PROFILE_PHOTO,
        profilePhotoObjectUrl: 'url.com',
      }

      expect(action).to.be.deep.equal(expectedAction)
      done()
    })

    it('should create an action to set country code', (done) => {
      const action = ViewsActions.actionCreators.setCountryCode('123')
      const expectedAction = {
        type: ViewsActions.SET_COUNTRY_CODE,
        countryCode: '123',
      }

      expect(action).to.be.deep.equal(expectedAction)
      done()
    })

    it('should create an action to set national number', (done) => {
      const action = ViewsActions.actionCreators.setNationalNumber('123456789')
      const expectedAction = {
        type: ViewsActions.SET_NATIONAL_NUMBER,
        nationalNumber: '123456789',
      }

      expect(action).to.be.deep.equal(expectedAction)
      done()
    })

    it('should create an action to set verification code', (done) => {
      const action = ViewsActions.actionCreators.setVerificationCode('123')
      const expectedAction = {
        type: ViewsActions.SET_VERIFICATION_CODE,
        verificationCode: '123',
      }

      expect(action).to.be.deep.equal(expectedAction)
      done()
    })

    it('should create an action to set exchange amount', (done) => {
      const action = ViewsActions.actionCreators.setExchangeAmount('123')
      const expectedAction = {
        type: ViewsActions.SET_EXCHANGE_AMOUNT,
        amount: '123',
      }

      expect(action).to.be.deep.equal(expectedAction)
      done()
    })

    it('should create an action to reset', (done) => {
      const action = ViewsActions.actionCreators.reset()
      const expectedAction = {
        type: ViewsActions.VIEWS_RESET,
      }

      expect(action).to.be.deep.equal(expectedAction)
      done()
    })
  })
})

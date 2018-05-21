import { BigNumber } from 'bignumber.js'
import * as postgres from '../../src/db/postgres'
import { assert } from '../tools'

describe('1. Users', () => {
  let newInsertedUser
  beforeEach( async () => {
    newInsertedUser = await postgres.users.addNewUser(
      `janeDoe${Date.now()}`,
      `jane.doe@email.com${Date.now()}`,
      `password123`,
      null,
    )
  })
  describe('1.1 Add user', () => {
    it('should add user succesfully', async () => {
      const username = `JaneDoe${Date.now()}`
      const email = `jane.doe@email.com${Date.now()}`
      const hashedPassword = 'password'
      const referrerCode = 'refcode'

      try {
        const newUser = await postgres.users.addNewUser(username, email, hashedPassword, referrerCode)

        assert(newUser !== null, 'user is null!')
      } catch (err) {
        assert.ok(false, err)
      }
    })
    it('should throw an error due to existing username when adding a user', async () => {
      const username = 'JaneDoe'
      const email = 'jane.doeDifferent@email.com'
      const hashedPassword = 'password'
      const referrerCode = 'refcode'

      try {
        await postgres.users.addNewUser(username, email, hashedPassword, referrerCode)
        assert.ok(false, 'error not thrown!')
      } catch (err) {
        return
      }
    })
    it('should throw an error due to existing email when adding a user', async () => {
      const username = 'JaneDoeDifferent'
      const email = 'jane.doe@email.com'
      const hashedPassword = 'password'
      const referrerCode = 'refcode'

      try {
        await postgres.users.addNewUser(username, email, hashedPassword, referrerCode)
        assert.ok(false, 'error not thrown!')
      } catch (err) {
        return
      }

    })
  })

  describe('1.2 Updating users', () => {
    it('should update user succesfully', async () => {
      try {
        newInsertedUser = await postgres.users.updateUser(newInsertedUser.id, { phone: `+123456789${Date.now()}` })
      } catch (err) {
        assert.ok(false, err.message)
      }
    })
    it('should throw an error due to non-existent ID', async () => {
      try {
        await postgres.users.updateUser('123', { username: 'Updated username' })
        assert.ok(false, 'error not thrown!')
      } catch (err) {
        assert(err.message === 'No data returned from the query.', 'A different error was thrown!')
        return
      }
    })
  })

  describe('1.3 Finding users by id', () => {
    it('should find user succesfully', async () => {
      const user = await postgres.users.findUser(newInsertedUser.id)

      assert(user !== null, 'no user returned!')
    })
    it('should not find user to non-existent ID', async () => {
      const user = await postgres.users.findUser('123')

      assert(user === null, 'User not null!')

    })
  })

  describe('1.4 Finding users by username', () => {
    it('should find user succesfully', async () => {
      const user = await postgres.users.findUserByUsername(newInsertedUser.username)

      assert(user !== null, 'no user returned!')

    })
    it('should not find user to non-existent username', async () => {
      const user = await postgres.users.findUserByUsername('dummyUsername')

      assert(user === null, 'User not null!')

    })
  })

  describe('1.5 Finding users by email', () => {
    it('should find user succesfully', async () => {
      const user = await postgres.users.findUserByEmail(newInsertedUser.email)

      assert(user !== null, 'no user returned!')
    })
    it('should not find user to non-existent email', async () => {
      const user = await postgres.users.findUserByEmail('noemail@email.com')

      assert(user === null, 'User not null!')
    })
  })

  describe('1.6 Finding users by phone', () => {
    it('should find user succesfully', async () => {
      newInsertedUser = await postgres.users.updateUser(newInsertedUser.id, { phone: `+123456789${Date.now()}` })
      const user = await postgres.users.findUserByPhone(newInsertedUser.phone)

      assert(user !== null, 'no user returned!')
    })
    it('should not find user to non-existent phone', async () => {
      const user = await postgres.users.findUserByPhone('+987654321')

      assert(user === null, 'User not null!')

    })
  })

  describe('1.7 Finding users by platform', () => {
    let insertedPlatform

    before(async () => {
      const platformUser = await postgres.users.addNewUser(
        `platformUser${Date.now()}`,
        `platformUser@email.com${Date.now()}`,
        'password',
        '123',
      )
      const platform = await postgres.platforms.addPlatform(platformUser.id, `123456${Date.now()}`, 'YOUTUBE')

      insertedPlatform = platform
    })
    it('should find user succesfully', async () => {
      const user = await postgres.users.findUserByPlatform(insertedPlatform.platform_id, insertedPlatform.platform_type)

      assert(user !== null, 'no user returned!')

    })
    it('should not find user to non-existent platform', async () => {
      const user = await postgres.users.findUserByPlatform('123456', 'TWITCH')

      assert(user === null, 'User not null!')

    })
  })

  describe('1.8 Finding users by referral code', () => {
    it('should find user succesfully', async () => {
      const user = await postgres.users.findUserByReferralCode(newInsertedUser.referral_code)

      assert(user !== null, 'no user returned!')
    })
    it('should not find user due to non-existent referral code', async () => {
      const user = await postgres.users.findUserByReferralCode('invalidreferral')

      assert(user === null, 'User not null!')
    })
  })
})

describe('2. Platforms', () => {
  let newInsertedPlatform
  let newInsertedUser

  beforeEach( async () => {
    newInsertedUser = await postgres.users.addNewUser(
      `janeDoe${Date.now()}`,
      `jane.doe@email.com${Date.now()}`,
      `password123`,
      null,
    )
    newInsertedPlatform = await postgres.platforms.addPlatform(newInsertedUser.id, `123${Date.now()}`, 'TWITCH')
  })
  describe('2.1 Add Platform', () => {
    it('should add platform succesfully', async () => {
      const platform = await postgres.platforms.addPlatform(newInsertedUser.id, `123${Date.now()}`, 'TWITCH')

      assert(platform !== null, 'No platform object returned')
    })
  })

  describe('2.2 Find platform', () => {
    it('should find platform succesfully', async () => {
      const platform = await postgres.platforms.findPlatformsByUserId(newInsertedUser.id)

      assert(platform !== null, 'No platform found')
    })
    it('should not find platform due to non-existent id', async () => {
      const platform = await postgres.platforms.findPlatformsByUserId('123')

      assert(platform.length === 0, 'Platform not null')
    })
  })

  describe('2.3 Delete platform', () => {
    it('should succesfully delete platform', async () => {
      const platform = await postgres.platforms.deletePlatform(newInsertedPlatform.id)

      assert(platform === null, 'Platform not succesfully deleted!')
    })
  })
})

describe('3. Upvotes', () => {
  describe('3.1 Adding upvotes', () => {
    let newInsertedUser

    before( async () => {
      newInsertedUser = await postgres.users.addNewUser(
        `janeDoe${Date.now()}`,
        `jane.doe@email.com${Date.now()}`,
        `password123`,
        null,
      )
    })
    it('should add upvote succesfully', async () => {
      const upvote = await postgres.upvotes.addNewUpvote(newInsertedUser.id, '123', '123', 'TWITCH', true)

      assert(upvote !== null, 'Upvote not added!')
    })

    it('should fail upvoting due to invalid user id', async () => {
      try {
        await postgres.upvotes.addNewUpvote('123', '123', '123', 'TWITCH', true)
        assert.ok(false, 'error not thrown')
      } catch (err) {
        return
      }
    })
  })
})

describe('4. Blacklists', () => {
  describe('4.1 Adding blacklist token', () => {
    it('should add blacklist token succesfully', async () => {
      const blacklistToken = await postgres.blacklist.addBlacklistToken(`123token${Date.now()}`)

      assert(blacklistToken !== null, 'blacklist token not added!')
    })
  })

  describe('4.2 Finding blacklist tokens', () => {
    let addedBlacklistToken

    before(async () => {
      addedBlacklistToken = await postgres.blacklist.addBlacklistToken(`123token${Date.now()}`)
    })
    it('should find blacklist token succesfully', async () => {
      const blacklistToken = await postgres.blacklist.findBlacklistToken(addedBlacklistToken.token)

      assert(blacklistToken !== null, 'blacklist token not found!')
    })
    it('should not find blacklist token due to non-existing id', async () => {
      const blacklistToken = await postgres.blacklist.findBlacklistToken('notoken')

      assert(blacklistToken === null, 'blacklist token found!')
    })
  })
})

describe('5. Promos', () => {
  let newInsertedUser
  beforeEach ( async () => {
    newInsertedUser = await postgres.users.addNewUser(
      `janeDoe${Date.now()}`,
      `jane.doe@email.com${Date.now()}`,
      `password123`,
      null,
    )
  })

  describe('5.1 Adding promo blacklists', () => {
    it('should add promo blacklist succesfully', async () => {
      const blacklistPromo = await postgres.promo.addUserPromoBlacklist(newInsertedUser.id)

      assert(blacklistPromo !== null, 'blacklist promo not added!')
    })
    it('should not add promo blacklist due to non-existent user id', async () => {
      try {
        await postgres.promo.addUserPromoBlacklist('123')

        assert.ok(false, 'no error thrown')
      } catch {
        return
      }
    })
  })

  describe('5.2 Finding promos', () => {
    it('should find promo sucesfully', async () => {
      await postgres.promo.addUserPromoBlacklist(newInsertedUser.id)
      const promo = await postgres.promo.findUserPromo(newInsertedUser.id)

      assert(promo !== null, 'promo not found!')
    })
    it('should not find promo', async () => {
      const promo = await postgres.promo.findUserPromo('123')

      assert(promo === null, 'promo found!')
    })
  })
})

describe('6. Transactions', () => {
  let insertedPlatform
  let newInsertedUser
  let addedTxs

  beforeEach(async () => {
    newInsertedUser = await postgres.users.addNewUser(
      `platformTxsUser${Date.now()}`,
      `platformTxsUser@email.com${Date.now()}`,
      'password',
      '123',
    )
    insertedPlatform = await postgres.platforms.addPlatform(newInsertedUser.id, `123${Date.now()}`, 'YOUTUBE')
    addedTxs = await postgres.txs.addTx({
      txHash: `123${Date.now()}`,
      txStatus: 'PENDING',
      txType: 'DEFAULT',
      value: new BigNumber(123),
      senderAddress: '123',
      senderUserId: newInsertedUser.id,
      recipientAddress: '456',
      recipientPlatformId: insertedPlatform.id,
      recipientPlatformType: insertedPlatform.platform_type,
    })
  })

  describe('6.1 Adding txs', () => {
    it('should add txs succesfully', async () => {
      const txs = await postgres.txs.addTx({
        txHash: `123${Date.now()}`,
        txStatus: 'PENDING',
        txType: 'DEFAULT',
        value: new BigNumber(123),
        senderAddress: '123',
        senderUserId: newInsertedUser.id,
        recipientAddress: '456',
        recipientPlatformId: insertedPlatform.id,
        recipientPlatformType: insertedPlatform.platform_type,
      })

      assert(txs !== null, 'txs not added!')
    })
  })

  describe('6.2 Updating txs', async () => {
    it('should update txs succesfully', async () => {
      const txs = await postgres.txs.updateTx(addedTxs.tx_hash, 'SENT')

      assert(txs !== null, 'txs not updated!')
    })
    it('should not update due to non-existent txHash', async () => {
      try {
        await postgres.txs.updateTx('123hash', 'SENT')
        assert.ok(false, 'no error thrown!')
      } catch (err) {
        return
      }
    })
  })

  describe('6.2 Finding tx by hash', () => {
    it('should find tx succesfully', async () => {
      const txs = await postgres.txs.findTxByHash(addedTxs.tx_hash)

      assert(txs !== null, 'txs not found!')
    })
    it('should find tx due to non-existent hash', async () => {
      const txs = await postgres.txs.findTxByHash('123hash')

      assert(txs === null, 'txs found!')
    })
  })

  describe('6.3 finding txs by platform', () => {
    it('should find platform succesfully', async () => {
      const txs = await postgres.txs.findTxByPlatform('SENT', 'DEFAULT', 'YOUTUBE', insertedPlatform.id)

      assert(txs !== null, 'no txs found by platform')
    })
    it('should not find platform due to non existent id', async () => {
      const txs = await postgres.txs.findTxByPlatform('SENT', 'DEFAULT', 'YOUTUBE', 'nonExistentId')

      assert(txs.length === 0, 'no txs found by platform')
    })
  })

  describe('6.4 find txs by username', () => {
    it('should find tx succesfully', async () => {
      const txs = await postgres.txs.findTxByUserWithUsernames(newInsertedUser.id)

      assert(txs !== null, 'no txs found!')
    })
  })

  describe('6.5 calculate slices', () => {
    before(async () => {
      // insert view
      const platform = await postgres.platforms.addPlatform(newInsertedUser.id, `123${Date.now()}`, 'TWITCH')

      await postgres.views.addNewView(newInsertedUser.id, 'videoUrl', '1', platform.platform_id, 'TWITCH')
    })
    it('should sucesfully calculate slices', async () => {
      const slices = await postgres.txs.calculateSlices()

      assert(slices !== null, 'slices not calculated')
    })
  })
})

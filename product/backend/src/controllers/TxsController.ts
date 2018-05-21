import { BigNumber } from 'bignumber.js'
import * as _ from 'lodash'
import { PlatformModels, tables, TxModels } from 'shared/dist/models'
import * as Errors from 'shared/dist/models/Errors/TxErrors'
import { StrTokenUtils } from 'shared/dist/str'
import { Authenticated, BodyParams, Controller, Get, PathParams, Post, Required } from 'ts-express-decorators'
import { BadRequest, NotFound } from 'ts-httpexceptions'
import { STREAM_HOT_WALLET_ADDRES } from '../config'
import * as postgres from '../db/postgres'
import DecodedParams from '../decorators/DecodedParams'
import { FAKE_ESCROW_STREAM_USER, TxService } from '../services/TxService'
import Mutex from '../utils/mutex'

export const PROMO_STR_VALUE = 500

@Controller('/txs')
export class TxsController {
  constructor(
    private txService: TxService,
  ) {
  }

  @Get('/')
  @Authenticated()
  public async getAll(
    @Required @DecodedParams('id') userId: string,
  ): Promise<TxModels.TxResponse[]> {

    const platforms = await postgres.platforms.findPlatformsByUserId(userId)

    const txs = await postgres.txs.findTxByUserWithUsernames(userId)

    const platformTxs = platforms.map((platform) => {
      return postgres.txs.findTxByPlatform(
        TxModels.UNCLAIMED,
        TxModels.ESCROW,
        platform.platform_type as PlatformModels.PlatformTypes,
        platform.platform_id,
      )
    })

    const unclaimedTxs = _.flatten(await Promise.all(platformTxs))

    return txs.concat(unclaimedTxs).map((tx) => TxModels.serialize(tx))
  }

  @Post('/send')
  @Authenticated()
  public async send(
    @Required @DecodedParams('id') userId: string,
    @Required @BodyParams('signedTransfer') signedTransfer: string,
    @Required @BodyParams('toUserId') toUserId: string,
    @Required @BodyParams('value') value: string,
    @Required @BodyParams('expiration') expiration: string,
    @Required @BodyParams('nonce') nonce: string,
    @BodyParams('message') message?: string,
    @BodyParams('recipientPlatformType') recipientPlatformType?: PlatformModels.PlatformTypes,
    @BodyParams('recipientPlatformId') recipientPlatformId?: string,
  ) {
    const user = await postgres.users.findUser(userId)
    if (!user.address) {
      throw new BadRequest(Errors.FROM_ADDRESS_MISSING)
    }

    let to: tables.users
    let txType: TxModels.TX_TYPE

    if (toUserId === FAKE_ESCROW_STREAM_USER.id) {
      to = FAKE_ESCROW_STREAM_USER
      txType = TxModels.ESCROW
    } else {
      to = await postgres.users.findUser(toUserId)
      txType = TxModels.DEFAULT
    }

    if (!to || !to.address) {
      throw new BadRequest(Errors.TO_ADDRESS_MISSING)
    }

    try {
      const transfer = await this.txService.signedTransfer(
        signedTransfer,
        user.address,
        to.address,
        new BigNumber(value),
        new BigNumber(expiration),
        new BigNumber(nonce),
        txType,
        userId,
        toUserId,
        recipientPlatformType,
        recipientPlatformId,
        message,
      )

      return transfer
    } catch (e) {
      throw new BadRequest(Errors.TRANSFER_FAILED)
    }
  }

  @Post('/claimEscrow/all')
  @Authenticated()
  public async claimEscrowAll(
    @Required @DecodedParams('id') userId: string,
  ): Promise<TxModels.TxResponse[]> {
    await Mutex.prototype.lock(userId, '/claimEscrow/all')
    const platforms = await postgres.platforms.findPlatformsByUserId(userId)
    const user = await postgres.users.findUser(userId)

    const platformTxs = platforms.map(async (platform) => {
      const unclaimedEscrowTxs = await postgres.txs.findTxByPlatform(
        TxModels.UNCLAIMED,
        TxModels.ESCROW,
        platform.platform_type as PlatformModels.PlatformTypes,
        platform.platform_id,
      )

      const txs = unclaimedEscrowTxs.map(async (tx) => {
        try {
          const newTx = await this.txService.transfer({
            txType: TxModels.DEFAULT,
            value: new BigNumber(tx.value),
            senderAddress: STREAM_HOT_WALLET_ADDRES,
            recipientUserId: user.id,
            recipientAddress: user.address,
            recipientPlatformType: tx.recipient_platform_type,
            recipientPlatformId: tx.recipient_platform_id,
            message: tx.message,
          })
          await postgres.txs.updateTx(tx.tx_hash, TxModels.CLAIMED)

          return newTx
        } catch (e) {
          postgres.txs.updateTx(tx.tx_hash, TxModels.UNCLAIMED)
          throw e
        }
      })
      return await Promise.all(txs)
    })

    try {
      const promise = await Promise.all(platformTxs.reduce((txs, platform) => txs.concat(platform), []))

      Mutex.prototype.unlock(userId, '/claimEscrow/all')
      return promise
    } catch (err) {
      Mutex.prototype.unlock(userId, '/claimEscrow/all')
      return err
    }
  }

  @Post('/claimEscrow/:txHash')
  @Authenticated()
  public async claimEscrow(
    @Required @DecodedParams('id') userId: string,
    @Required @PathParams('txHash') txHash: string,
  ): Promise<TxModels.TxResponse> {
    Mutex.prototype.lock(userId, `/claimEscrow/${txHash}`)
    const tx = await postgres.txs.findTxByHash(txHash)
    if (!tx) {
      throw new BadRequest(Errors.TX_HASH_NOT_FOUND)
    }

    const platforms = await postgres.platforms.findPlatformsByUserId(userId)

    // Check if the escrow tx is assigned to the correct user.
    const canUserClaimEscrow = platforms.reduce((belongsToUser, platform) => {
      return belongsToUser ||
        (platform.platform_type === tx.recipient_platform_type && platform.platform_id === tx.recipient_platform_id)
    }, false)
    if (!canUserClaimEscrow) {
      throw new BadRequest(Errors.TRANSFER_FAILED)
    }

    // Check if the status of the transaction is unclaimed.
    const isTxUnclaimed = (tx.tx_status === TxModels.UNCLAIMED)
    if (!isTxUnclaimed) {
      throw new BadRequest(Errors.TRANSFER_FAILED)
    }

    try {
      const user = await postgres.users.findUser(userId)
      const newTx = await this.txService.transfer({
        txType: TxModels.DEFAULT,
        value: new BigNumber(tx.value),
        senderAddress: STREAM_HOT_WALLET_ADDRES,
        recipientUserId: userId,
        recipientAddress: user.address,
        recipientPlatformType: tx.recipient_platform_type,
        recipientPlatformId: tx.recipient_platform_id,
        message: tx.message,
      })

      await postgres.txs.updateTx(tx.tx_hash, TxModels.CLAIMED)

      Mutex.prototype.unlock(userId, '/claimEscrow/' + txHash)
      return TxModels.serialize(newTx)
    } catch (e) {
      Mutex.prototype.unlock(userId, '/claimEscrow/' + txHash)
      throw new BadRequest(Errors.TRANSFER_FAILED)
    }
  }

  // TODO: Temporary endpoint to get promo status
  @Get('/promo')
  @Authenticated()
  public async promoStatus(
    @Required @DecodedParams('id') userId: string,
  ): Promise<boolean> {
    return await postgres.promo.findUserPromo(userId) ? true : false
  }

  @Post('/promo')
  @Authenticated()
  public async redeemPromo(
    @Required @DecodedParams('id') userId: string,
  ): Promise<boolean> {
    const user = await postgres.users.findUser(userId)
    const userUnverified = _(user.phone).isEmpty()
    const addressMissing = _(user.address).isEmpty()

    if (userUnverified || addressMissing) {
      throw new BadRequest(Errors.TRANSFER_FAILED)
    }

    const promoRedeemed = await postgres.promo.findUserPromo(userId)

    if (promoRedeemed) {
      throw new BadRequest(Errors.TRANSFER_FAILED)
    }

    // Optimistically add user to the promo blacklist DB
    postgres.promo.addUserPromoBlacklist(userId)
    await this.txService.transfer({
      txType: TxModels.PROMO_REFERRAL,
      value: StrTokenUtils.strToTwei(new BigNumber(PROMO_STR_VALUE)),
      senderAddress: FAKE_ESCROW_STREAM_USER.address,
      recipientUserId: user.id,
      recipientAddress: user.address,
    })

    return true
  }

  @Get('/txHash/:txHash')
  @Authenticated()
  public async getTx(
    @Required @PathParams('txHash') txHash: string,
  ): Promise<TxModels.TxResponse> {
    try {
      const tx = await postgres.txs.findTxByHash(txHash)
      return TxModels.serialize(tx)
    } catch (e) {
      throw new NotFound(Errors.TX_HASH_NOT_FOUND)
    }
  }
}

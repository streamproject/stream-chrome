import { BigNumber } from 'bignumber.js'
import { PlatformModels, tables, TxModels } from 'shared/dist/models'
import * as Errors from 'shared/dist/models/Errors/TxErrors'
import { StrTokenUtils } from 'shared/dist/str'
import * as HDWalletProvider from 'truffle-hdwallet-provider'
import { Service } from 'ts-express-decorators'
import { BadRequest } from 'ts-httpexceptions'
import Web3 = require('web3')
import { GAS, GAS_PRICE, STR_TOKEN_ADDRESS, STREAM_HOT_WALLET_ADDRES, WEB3_PROVIDER_URI } from '../config'
import { MNEMONIC } from '../config'
import * as postgres from '../db/postgres'
import genUuid from '../utils/genUuid'

export const FAKE_ESCROW_STREAM_USER: tables.users = {
  id: null,
  email: null,
  username: null,
  address: STREAM_HOT_WALLET_ADDRES,
  prof_pic: null,
  phone: null,
  password: null,
  referral_code: null,
  referrer_id: null,
  permalink: null,
  verify_token: null,
  verified: null,
}

@Service()
export class TxService {
  public web3: Web3
  public strToken: StrTokenUtils.ISTRTokenImplementation

  constructor() {
    this.web3 = new Web3(new HDWalletProvider(MNEMONIC, WEB3_PROVIDER_URI))
    this.strToken = StrTokenUtils.getStrToken(this.web3, STR_TOKEN_ADDRESS)
  }

public async transfer(data: {
  txType: TxModels.TX_TYPE,
  value: BigNumber,
  senderUserId?: string,
  senderAddress: string,
  recipientUserId?: string,
  recipientAddress: string,
  recipientPlatformType?: string,
  recipientPlatformId?: string,
  message?: string,
  metadata?: string,
}): Promise<tables.txs> {
    if (!StrTokenUtils.strToTwei(data.value)) {
      throw new BadRequest(Errors.INVALID_AMOUNT)
    }

    // TODO: Verify this is correct logic. eg will on('transactionHash') always
    // fire? Will tx tmieout but still go through?
    try {
      const tx = await this.strToken.methods.transfer(data.recipientAddress, data.value).send({
        from: data.senderAddress,
        gas: GAS,
        gasPrice: GAS_PRICE,
      }).on('transactionHash', (txHash) => {
        postgres.txs.addTx({
          ...data,
          txHash,
          txStatus: TxModels.PENDING,
        })
      })

      if (data.txType === TxModels.ESCROW && data.recipientAddress === FAKE_ESCROW_STREAM_USER.address) {
        return await postgres.txs.updateTx(tx.transactionHash, TxModels.UNCLAIMED)
      } else {
        return await postgres.txs.updateTx(tx.transactionHash, TxModels.SENT)
      }
    } catch (e) {
      return await postgres.txs.addTx({
        ...data,
        txHash: genUuid(),
        txStatus: TxModels.FAILED,
      })
    }
  }

  public async signedTransfer(
    signature: string,
    from: string,
    to: string,
    value: BigNumber,
    expiration: BigNumber,
    nonce: BigNumber,
    txType: TxModels.TX_TYPE,
    senderUserId: string,
    recipientUserId?: string,
    recipientPlatformType?: PlatformModels.PlatformTypes,
    recipientPlatformId?: string,
    message?: string,
    metadata?: string,
): Promise<tables.txs> {
    if (!StrTokenUtils.strToTwei(value)) {
      throw new BadRequest(Errors.INVALID_AMOUNT)
    }

    const { r, s, v } = StrTokenUtils.getECDSA(signature)

    try {
      const tx = await this.strToken.methods.signedTransfer(
        from,
        to,
        value,
        expiration,
        nonce,
        v,
        r,
        s,
      ).send({
        from: STREAM_HOT_WALLET_ADDRES,
        gas: GAS,
        gasPrice: GAS_PRICE,
      }).on('transactionHash', (txHash) => {
        postgres.txs.addTx({
          txHash,
          txStatus: TxModels.PENDING,
          txType,
          value,
          senderUserId,
          senderAddress: from,
          recipientAddress: to,
          recipientPlatformType,
          recipientPlatformId,
          message,
          metadata,
        })
      })

      if (txType === TxModels.ESCROW && to === FAKE_ESCROW_STREAM_USER.address) {
        return await postgres.txs.updateTx(tx.transactionHash, TxModels.UNCLAIMED)
      } else {
        return await postgres.txs.updateTx(tx.transactionHash, TxModels.SENT)
      }
    } catch (e) {
      return await postgres.txs.addTx({
        txHash: genUuid(),
        txStatus: TxModels.FAILED,
        txType,
        value,
        senderUserId,
        senderAddress: from,
        recipientAddress: to,
        recipientPlatformType,
        recipientPlatformId,
        message,
        metadata,
      })
    }
  }

}

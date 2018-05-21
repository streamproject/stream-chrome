import { BigNumber } from 'bignumber.js'
import Web3 = require('web3')
import { EventLog } from 'web3/types'
import { Contract, TransactionObject } from 'web3/types.d'
import { STRTokenImplementation } from './smart-contracts/STRTokenImplementation'

export interface ISTRTokenImplementation extends Contract {
  methods: {
    getSignableTransfer(
      from: string,
      to: string,
      value: BigNumber,
      expiration: BigNumber,
      nonce: BigNumber,
    ): TransactionObject<string>,
    signedTransfer(
      from: string,
      to: string,
      value: BigNumber,
      expiration: BigNumber,
      nonce: BigNumber,
      v: string,
      r: string,
      s: string,
    ): TransactionObject<EventLog>,
    transfer(
      to: string,
      tokens: BigNumber,
    ): TransactionObject<EventLog>,
    balanceOf(
      address: string,
    ): TransactionObject<BigNumber>,
    isSignedTransferNonceUsed(
      address: string,
      nonce: BigNumber,
    ),
  }
}

export function getStrToken(
  web3: Web3,
  strTokenAddress: string,
  options?: {
      from?: string
      gas?: string | number | BigNumber,
      gasPrice?: number
      data?: string,
  }) {

  return new web3.eth.Contract(STRTokenImplementation.abi, strTokenAddress, options) as ISTRTokenImplementation
}

export async function getNonce(web3: Web3, STRToken: ISTRTokenImplementation, address: string) {
  let nonce = new BigNumber(web3.utils.randomHex(32))
  let isNonceUsed = await STRToken.methods.isSignedTransferNonceUsed(address, nonce).call()

  while (isNonceUsed) {
    nonce = new BigNumber(web3.utils.randomHex(32))
    isNonceUsed = await STRToken.methods.isSignedTransferNonceUsed(address, nonce)
  }

  return nonce
}

export function getECDSA(signature: string) {
  const r = '0x' + signature.slice(2, 66)
  const s = '0x' + signature.slice(66, 130)
  const v = '0x' + signature.slice(130, 132)

  return { r, s, v }
}

export const STR_TO_TWEI = new BigNumber('1e18')
export const strToTwei = (value: BigNumber) => value.mul(STR_TO_TWEI)
export const tweiToStr = (value: BigNumber) => value.div(STR_TO_TWEI)

export function isValidTwei(value: BigNumber) {
  return value.greaterThan(0) && value.dp() === 0
}

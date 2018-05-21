import { PlatformModels } from '.'
import * as tables from './tables'

export const PENDING = 'PENDING'
export const SENT = 'SENT'
export const FAILED = 'FAILED'

export const UNCLAIMED = 'UNCLAIMED'
export const CLAIMED = 'CLAIMED'

export type TX_STATUS = typeof PENDING | typeof SENT | typeof FAILED | typeof UNCLAIMED | typeof CLAIMED

export const ESCROW = 'ESCROW'
export const DEFAULT = 'DEFAULT'

export const PROMO_SLICE = 'PROMO_SLICE'
export const PROMO_CRUMB = 'PROMO_CRUMB'

export const PROMO_REFERRAL = 'PROMO_REFERRAL'
export const PROMO_SIGNUP = 'PROMO_SIGNUP'
export const PROMO_YOUTUBE = 'PROMO_YOUTUBE'
export const PROMO_TWITCH = 'PROMO_TWITCH'

export type TX_TYPE =
  | typeof PROMO_SLICE
  | typeof PROMO_CRUMB
  | typeof PROMO_REFERRAL
  | typeof PROMO_SIGNUP
  | typeof ESCROW
  | typeof DEFAULT

export type TxResponse = {
  txHash: string,
  txStatus: TX_STATUS,
  txType: TX_TYPE,
  value: string,
  senderUserId: string,
  senderAddress: string,
  senderUsername?: string,
  recipientUserId: string,
  recipientAddress: string,
  recipientPlatformType: PlatformModels.PlatformTypes,
  recipientPlatformId: string,
  recipientUsername?: string,
  message: string,
  metadata: string,
  datetime: string,
}

export function serialize(tx: tables.txs & { sender_username?: string, recipient_username?: string}): TxResponse {
  return {
    txHash: tx.tx_hash,
    txStatus: tx.tx_status as TX_STATUS,
    txType: tx.tx_type as TX_TYPE,
    value: tx.value,
    senderUserId: tx.sender_user_id,
    senderAddress: tx.sender_address,
    senderUsername: tx.sender_username,
    recipientUserId: tx.recipient_user_id,
    recipientAddress: tx.recipient_address,
    recipientPlatformType: tx.recipient_platform_type as PlatformModels.PlatformTypes,
    recipientPlatformId: tx.recipient_platform_id,
    recipientUsername: tx.recipient_username,
    message: tx.message,
    metadata: tx.metadata,
    datetime: tx.datetime.toString(),
  }
}

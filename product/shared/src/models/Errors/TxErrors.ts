export const FROM_ADDRESS_MISSING = 'FROM_ADDRESS_MISSING'
export const TO_ADDRESS_MISSING = 'TO_ADDRESS_MISSING'
export const TRANSFER_FAILED = 'TRANSFER_FAILED'
export const INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS'
export const INVALID_AMOUNT = 'INVALID_AMOUNT'

export const TX_HASH_NOT_FOUND = 'TX_HASH_NOT_FOUND'

export type ERRORS_TYPE =
  | typeof FROM_ADDRESS_MISSING
  | typeof TO_ADDRESS_MISSING
  | typeof TRANSFER_FAILED
  | typeof INSUFFICIENT_FUNDS
  | typeof INVALID_AMOUNT
  | typeof TX_HASH_NOT_FOUND

export const Errors = {
  FROM_ADDRESS_MISSING: {
    type: typeof FROM_ADDRESS_MISSING,
    humanized: 'From address is missing.',
  },
  TO_ADDRESS_MISSING: {
    type: typeof TO_ADDRESS_MISSING,
    humanized: 'To address is missing.',
  },
  TRANSFER_FAILED: {
    type: typeof TRANSFER_FAILED,
    humanized: 'Transfer failed.',
  },
  INSUFFICIENT_FUNDS: {
    type: typeof INSUFFICIENT_FUNDS,
    humanized: `Insufficient funds. <a href='#' target="_blank">Learn how to earn more Stream Tokens.</a>`,
  },
  INVALID_AMOUNT: {
    type: typeof INVALID_AMOUNT,
    humanized: 'Invalid amount. Cannot be positive and contain less than 18 decimal points.',
  },
  TX_HASH_NOT_FOUND: {
    type: typeof TX_HASH_NOT_FOUND,
    humanized: 'Could not find the transaction',
  },
}

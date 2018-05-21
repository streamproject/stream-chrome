import * as fs from 'fs'

function readFromFileIfExists(filePath): string {
  if (!filePath) {
    return undefined
  }

  const untrimmed = fs.readFileSync(filePath, { encoding: 'utf8' })
  return untrimmed.trimRight()
}

export const ENV = process.env.NODE_ENV

export const POSTGRES_HOST = process.env.POSTGRES_HOST
export const POSTGRES_USER = process.env.POSTGRES_USER
export const POSTGRES_PASS = process.env.POSTGRES_PASS || readFromFileIfExists(process.env.POSTGRES_PASSWORD_FILE)

export const POSTGRES_DB = process.env.POSTGRES_DB

export const BUCKET_NAME = process.env.BUCKET_NAME

export const PORT = parseInt(process.env.PORT, 10)

export const TWILIO_API_KEY = readFromFileIfExists(process.env.TWILIO_API_KEY)

export const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID
export const TWITCH_SECRET = readFromFileIfExists(process.env.TWITCH_SECRET)
export const TWITCH_REDIRECT_URI = process.env.TWITCH_REDIRECT_URI

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
export const GOOGLE_SECRET = readFromFileIfExists(process.env.GOOGLE_SECRET)
export const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI

export const MNEMONIC = readFromFileIfExists(process.env.MNEMONIC)

export const INFURA_ACCESS_TOKEN = process.env.INFURA_ACCESS_TOKEN
export const WEB3_PROVIDER_URI = INFURA_ACCESS_TOKEN ?
`${process.env.WEB3_PROVIDER_URI}/${INFURA_ACCESS_TOKEN}` : process.env.WEB3_PROVIDER_URI

export const STREAM_HOT_WALLET_ADDRES = process.env.STREAM_HOT_WALLET_ADDRESS
export const STR_TOKEN_ADDRESS = process.env.STR_TOKEN_ADDRESS

export const GAS = parseInt(process.env.GAS, 10)
export const GAS_PRICE = parseInt(process.env.GAS_PRICE, 10)

export const PHONE_SALT_HASH = readFromFileIfExists(process.env.PHONE_SALT_HASH)

export const REDIS_HOST = process.env.REDIS_HOST
export const REDIS_PORT = parseInt(process.env.REDIS_PORT, 10)

export const SALT_ROUNDS = 12

export const ACCESS_TOKEN_EXPIRE = 60 * 60 * 24

export const EMAIL_ACCOUNT = readFromFileIfExists(process.env.EMAIL_ACCOUNT)
export const EMAIL_PASS = readFromFileIfExists(process.env.EMAIL_PASS)

export const OAUTH2_STATIC_CLIENT_ID = 1

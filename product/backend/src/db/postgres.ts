import { BigNumber } from 'bignumber.js'
import * as _ from 'lodash'
import * as pgPromise from 'pg-promise'
import { PlatformModels, tables, TxModels, UserModels } from 'shared/dist/models'
import { POSTGRES_DB, POSTGRES_HOST, POSTGRES_PASS, POSTGRES_USER } from '../config'
import genReferralCode from '../utils/genReferralCode'
import genUuid from '../utils/genUuid'
import queries from './queries'

const cn = {
  database: POSTGRES_DB,
  host: POSTGRES_HOST,
  password: POSTGRES_PASS,
  port: 5432,
  user: POSTGRES_USER,
}

const postgresdb = pgPromise()(cn)

// wrapper around postgresdb.one to enforce stronger types
const addOrUpdateRow = async <T>(query: pgPromise.TQuery, newRow: T): Promise<T> => {
  return await postgresdb.one<T>(query, newRow)
}

export async function postgresdbExists() {
  try {
    const obj = await postgresdb.connect()
    obj.done()
    return true
  } catch (err) {
    return false
  }
}

export const accessTokens = {
  async addNewAccessToken(
    token: string,
    userId: string,
    clientId: string,
    expires: number,
  ) {
    const newAccessToken = {
      id: genUuid(),
      token,
      userId,
      clientId,
      expires,
    }

    return await postgresdb.one<tables.access_tokens>(
      `INSERT INTO access_tokens VALUES(
        $(id),
        $(token),
        $(userId),
        $(clientId),
        $(expires)
      ) RETURNING *`,
      newAccessToken,
    )
  },

  async findToken(
    token: string,
  ) {
    return postgresdb.oneOrNone<tables.access_tokens>(
      `SELECT * FROM access_tokens WHERE token=$(token)`,
      { token },
    )
  },

  async deleteToken(
    userId: string,
    clientId: string,
  ) {
    return postgresdb.none(
      'DELETE from access_tokens WHERE user_id=$(userId) AND client_id=$(clientId)',
      { userId, clientId },
    )
  },
}

export const refreshTokens = {
  async addNewRefreshToken(
    token: string,
    userId: string,
    clientId: string,
  ) {
    const newRefreshToken = {
      id: genUuid(),
      token,
      userId,
      clientId,
    }

    return await postgresdb.one<tables.refresh_tokens>(
      `INSERT INTO refresh_tokens VALUES(
        $(id),
        $(token),
        $(userId),
        $(clientId)
      ) RETURNING *`,
      newRefreshToken,
    )
  },

  async findToken(
    token: string,
  ) {
    return postgresdb.oneOrNone<tables.refresh_tokens>(
      `SELECT * FROM refresh_tokens WHERE token=$(token)`,
      { token },
    )
  },

  async deleteToken(
    userId: string,
    clientId: string,
  ) {
    return postgresdb.none(
      'DELETE from refresh_tokens WHERE user_id=$(userId) AND client_id=$(clientId)',
      { userId, clientId },
    )
  },
}

export const users = {
  async addNewUser(
    username: string,
    email: string,
    password: string,
    referrerCode: string,
    verifyToken: string,
    permalink: string,
  ) {

    // Find the referring party if it exists
    let referrerId = null

    // If referrerCode is null, skip the check
    if (!_(referrerCode).isEmpty() && referrerCode.length !== 0) {
      // Returns null if no user with referral code exists
      const referrer = await users.findUserByReferralCode(referrerCode)

      if (referrer) {
        referrerId = UserModels.serialize(referrer).id
      }
    }

    // Guarantee that referral codes will not accidentally overlap
    let generatedReferralCode = ''
    while (true) {
      generatedReferralCode = genReferralCode(username)
      const existingRefCode = await users.findUserByReferralCode(generatedReferralCode)
      if (!existingRefCode) {
        break
      }
    }

    const newUser = {
      username,
      email,
      password,
      id: genUuid(),
      phone: null,
      address: null,
      prof_pic: null,
      referral_code: genReferralCode(username),
      // TODO: Placeholder referrer ID. Replace with real ID once we map codes.
      referrer_id: referrerId,
      verifyToken,
      permalink,
    }

    return await postgresdb.one<tables.users>(
      `INSERT INTO users VALUES(
        $(id),
        $(username),
        $(email),
        $(password),
        $(phone),
        $(address),
        $(prof_pic),
        $(referral_code),
        $(referrer_id),
        $(permalink),
        $(verifyToken)
      ) RETURNING *`,
      newUser,
    )
  },

  updateUser(
    id: tables.usersFields.id,
    updates: {
      username?: tables.usersFields.username,
      email?: tables.usersFields.email,
      password?: tables.usersFields.password,
      address?: tables.usersFields.address,
      profPic?: tables.usersFields.prof_pic,
      referral_code?: tables.usersFields.referral_code,
      referrer_id?: tables.usersFields.referrer_id,
      // phone should only ever be updated via 2-auth
      phone?: tables.usersFields.phone,
      verified?: tables.usersFields.verified,
    },
  ) {
    const updatedUser = {
      id,
      username: updates.username,
      email: updates.email,
      password: updates.password,
      phone: updates.phone,
      address: updates.address,
      prof_pic: updates.profPic,
      referral_code: updates.referral_code,
      referrer_id: updates.referrer_id,
      verified: updates.verified,
      permalink: null,
      verify_token: null,
    }

    return addOrUpdateRow<tables.users>(queries.updateUser, updatedUser)
  },

  findUser(id: string) {
    return postgresdb.oneOrNone<tables.users>(queries.findUser, { col: 'id', value: id })
  },

  // This can throw an exception of more than one row returned, but should not
  // happen since UNIQUE constraint is applied.
  findUserByUsername(username: string) {
    return postgresdb.oneOrNone<tables.users>(queries.findUser, { col: 'username', value: username })
  },

  findUserByEmail(email: string) {
    return postgresdb.oneOrNone<tables.users>(queries.findUser, { col: 'email', value: email })
  },

  findUserByPhone(phone: string) {
    return postgresdb.oneOrNone<tables.users>(queries.findUser, { col: 'phone', value: phone })
  },

  findUserByPlatform(platformId: string, platformType: PlatformModels.PlatformTypes) {
    return postgresdb.oneOrNone<tables.users>(queries.findUserByPlatform, {
      platform_id: platformId,
      platform_type: platformType,
    })
  },

  findUserByReferralCode(referralCode: string) {
    return postgresdb.oneOrNone<tables.users>(queries.findUser, { col: 'referral_code', value: referralCode })
  },

  findUserByPermalink(permalink: string) {
    return postgresdb.oneOrNone<tables.users>(
      'SELECT * FROM users WHERE permalink=${permalink}',
      { permalink },
    )
  },

}

export const views = {
  addNewView(
    userId: tables.viewsFields.user_id,
    videoUrl: tables.viewsFields.video_url,
    videoId: tables.viewsFields.video_id,
    platformId: tables.viewsFields.platform_id,
    platformType: PlatformModels.PlatformTypes,
  ) {
    const id = genUuid()

    const newView = {
      id,
      user_id: userId,
      video_url: videoUrl,
      video_id: videoId,
      platform_id: platformId,
      platform_type: platformType,
      datetime: undefined,
    }

    return addOrUpdateRow<tables.views>(queries.addView, newView)
  },
}

export const txs = {
  addTx(data: {
    txHash: string,
    txStatus: TxModels.TX_STATUS,
    txType: TxModels.TX_TYPE,
    value: BigNumber,
    senderUserId?: string,
    senderAddress: string,
    recipientAddress: string,
    recipientUserId?: string,
    recipientPlatformType?: string,
    recipientPlatformId?: string,
    message?: string,
    metadata?: string,
  }) {
    const newTx: tables.txs = {
      tx_hash: data.txHash,
      tx_status: data.txStatus,
      tx_type: data.txType,
      value: data.value.toString(),
      sender_user_id: data.senderUserId,
      sender_address: data.senderAddress,
      recipient_user_id: data.recipientUserId,
      recipient_address: data.recipientAddress,
      recipient_platform_type: data.recipientPlatformType,
      recipient_platform_id: data.recipientPlatformId,
      message: data.message,
      metadata: data.metadata,
      datetime: null,
    }

    return postgresdb.one<tables.txs>(
      `INSERT INTO txs VALUES (
        $(tx_hash),
        $(tx_status),
        $(tx_type),
        $(value),
        $(sender_user_id),
        $(sender_address),
        $(recipient_user_id),
        $(recipient_address),
        $(recipient_platform_type),
        $(recipient_platform_id),
        $(message),
        $(metadata),
        CURRENT_TIMESTAMP
      ) RETURNING *`,
      newTx,
    )
  },

  updateTx(txHash: string, status?: string, metadata?: string) {
    return postgresdb.one<tables.txs>(
      `UPDATE Txs
        SET (tx_status, metadata) = (
          COALESCE($(status), tx_status),
          COALESCE($(metadata), metadata)
        )
        WHERE tx_hash = $(txHash)
        RETURNING *`,
      { txHash, status, metadata },
    )
  },

  findTxByHash(txHash: string) {
    return postgresdb.oneOrNone<tables.txs>(
      `SELECT * FROM txs WHERE tx_hash=$(txHash)`,
      { txHash },
    )
  },

  findTxByPlatform(
    txStatus: TxModels.TX_STATUS,
    txType: TxModels.TX_TYPE,
    platformType: PlatformModels.PlatformTypes,
    platformId: string,
  ) {
    return postgresdb.manyOrNone<tables.txs>(
      `SELECT * FROM txs
        WHERE tx_status=$(txStatus) AND
        tx_type=$(txType) AND
        recipient_platform_type=$(platformType) AND
        recipient_platform_id=$(platformId)`,
      { txStatus, txType, platformType, platformId },
    )
  },

  findTxByUserWithUsernames(userId: string) {
    return postgresdb.manyOrNone<tables.txs>(
      `SELECT t.*, r.username as recipient_username FROM
      (
        SELECT f.*, s.username as sender_username FROM (
          SELECT * FROM txs
          WHERE sender_user_id=$(userId) OR recipient_user_id=$(userId)
        ) as f
        LEFT JOIN users as s ON s.id = f.sender_user_id
      ) as t
      LEFT JOIN users as r on r.id = t.recipient_user_id`,
      { userId },
    )
  },

  calculateSlices() {
    type slices = {
      id: string,
      address: string,
      platform_type: string,
      platform_id: string,
      count: string,
    }
    return postgresdb.manyOrNone<slices>(
      `SELECT u.id, u.address, t.platform_type, t.platform_id, count(*) FROM (
        SELECT p.user_id, v.platform_id, v.platform_type FROM (
          views as v
          LEFT JOIN platforms as p
          on (v.platform_id = p.platform_id and v.platform_type = p.platform_type)
        )
        WHERE v.datetime >= current_timestamp - interval '24 hours'
      ) AS t
      LEFT JOIN users as u
      ON u.id = t.user_id
      GROUP BY u.id, t.platform_type, t.platform_id`,
    )
  },
}

export const platforms = {
  addPlatform(
    userId: string,
    platformId: string,
    platformType: PlatformModels.PlatformTypes,
  ) {
    const newPlatform = {
      id: genUuid(),
      user_id: userId,
      platform_id: platformId,
      platform_type: platformType,
    }

    return addOrUpdateRow<tables.platforms>(queries.addPlatform, newPlatform)
  },

  findPlatformsByUserId(userId: string) {
    return postgresdb.manyOrNone<tables.platforms>(queries.findPlatformsByUserId, { user_id: userId })
  },

  deletePlatform(id: string) {
    return postgresdb.none(queries.deletePlatform, { id })
  },
}

export const upvotes = {
  addNewUpvote(
    userId: tables.upvotesFields.user_id,
    videoId: tables.upvotesFields.video_id,
    platformId: tables.upvotesFields.platform_id,
    platformType: PlatformModels.PlatformTypes,
    upvoted: tables.upvotesFields.upvoted,
  ) {
    const id = genUuid()

    const newUpvote = {
      id,
      user_id: userId,
      video_id: videoId,
      platform_id: platformId,
      platform_type: platformType,
      upvoted,
      datetime: undefined,
    }

    return addOrUpdateRow<tables.upvotes>(queries.addUpvote, newUpvote)
  },
}

export const blacklist = {
  addBlacklistToken(token: string) {
    return addOrUpdateRow<tables.blacklist>(queries.addToken, { token })
  },

  findBlacklistToken(token) {
    return postgresdb.oneOrNone<tables.blacklist>(queries.findToken, { token })
  },
}

export const promo = {
  addUserPromoBlacklist(userId: string) {
    const newUserPromoBlacklist = {
      user_id: userId,
    }

    return addOrUpdateRow<tables.promoblacklist>(queries.addUserPromoBlacklist, newUserPromoBlacklist)
  },

  findUserPromo(userId: string) {
    return postgresdb.oneOrNone<tables.promoblacklist>(queries.findUserPromo, { user_id: userId })
  },
}

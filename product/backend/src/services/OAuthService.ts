import { AfterRoutesInit } from '@tsed/common'
import * as bcrypt from 'bcrypt-nodejs'
import * as crypto from 'crypto'
import * as oauth2orize from 'oauth2orize'
import * as Errors from 'shared/dist/models/Errors/AuthErrors'
import { Service } from 'ts-express-decorators'
import { BadRequest, Forbidden } from 'ts-httpexceptions'
import { promisify } from 'util'
import { ACCESS_TOKEN_EXPIRE } from '../config'
import * as postgres from '../db/postgres'

const server = oauth2orize.createServer()

@Service()
export class OAuthService implements AfterRoutesInit {
  public $afterRoutesInit() {
    this.initServerExchanges()
  }

  private initServerExchanges() {
    server.exchange(oauth2orize.exchange.password(async (client, username, password, scope, done) => {
      const user = await postgres.users.findUserByUsername(username)

      if (user === null) {
        return done(new BadRequest(Errors.AUTH_ERROR))
      }

      const isMatch = await promisify<string, string, boolean>(bcrypt.compare)(password, user.password)

      if (!isMatch) {
         return done(new Forbidden(Errors.AUTH_ERROR))
      }

      const accessToken = crypto.randomBytes(32).toString('hex')
      const refreshToken = crypto.randomBytes(32).toString('hex')

      await postgres.refreshTokens.deleteToken(user.id, '123')
      await postgres.accessTokens.addNewAccessToken(accessToken, user.id, '123', Math.round((Date.now() + ACCESS_TOKEN_EXPIRE) / 1000))
      await postgres.refreshTokens.addNewRefreshToken(refreshToken, user.id, '123')

      return done(null, accessToken, refreshToken, {
        scope,
        user,
      })
    }))

    server.exchange(oauth2orize.exchange.refreshToken(async (client, refreshToken, scope, done) => {

      const token = await postgres.refreshTokens.findToken(refreshToken)
      if (!token) {
        return done(null, false)
      }

      const user = await postgres.users.findUser(token.user_id)

      if (!user) {
        return done(null, false)
      }

      await postgres.accessTokens.deleteToken(user.id, '123')

      const tokenValue = crypto.randomBytes(32).toString('hex')
      await postgres.accessTokens.addNewAccessToken(
        tokenValue,
        user.id,
        '123',
        Math.round((Date.now() + ACCESS_TOKEN_EXPIRE) / 1000),
      )

      return done(null, tokenValue)
    }))

  }
}

export const serverInstance = server

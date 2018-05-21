import { AfterRoutesInit, BeforeRoutesInit } from '@tsed/common'
import * as bcrypt from 'bcrypt-nodejs'
import * as crypto from 'crypto'
import * as _ from 'lodash'
import * as Passport from 'passport'
import * as PassportHttpBearer from 'passport-http-bearer'
import * as PassportLocal from 'passport-local'
import * as PassportClientPassword from 'passport-oauth2-client-password'
import { AuthModels } from 'shared/dist/models'
import * as Errors from 'shared/dist/models/Errors/AuthErrors'
import { ExpressApplication, Inject, ServerSettingsService } from 'ts-express-decorators'
import { Service } from 'ts-express-decorators'
import { BadRequest, Conflict } from 'ts-httpexceptions'
import { promisify } from 'util'
import { isEmail } from 'validator'
import { OAUTH2_STATIC_CLIENT_ID, SALT_ROUNDS } from '../config'
import * as postgres from '../db/postgres'
import { isPasswordValid } from '../utils/isPasswordValid'

const BearerStrategy = PassportHttpBearer.Strategy
const ClientPasswordStrategy = PassportClientPassword.Strategy

@Service()
export class PassportLocalService implements BeforeRoutesInit, AfterRoutesInit {

  constructor(
    private serverSettings: ServerSettingsService,
    @Inject(ExpressApplication) private expressApplication: ExpressApplication,
  ) {}

  public $beforeRoutesInit() {
    const options: any = this.serverSettings.get('passport') || {} as any
    const { userProperty, pauseStream } = options // options stored with ServerSettings

    this.expressApplication.use(Passport.initialize({ userProperty }))
    this.expressApplication.use(Passport.session({ pauseStream }))

    this.initializeLogin()
  }

  public $afterRoutesInit() {
    this.initializeSignup()
  }

  public async checkSignup(
    email: string,
    username: string,
    password: string,
  ): Promise<AuthModels.AuthResponse> {
    if (!username) {
      throw new BadRequest(Errors.INVALID_USERNAME)
    }

    const usernameTaken = await postgres.users.findUserByUsername(username)
    if (usernameTaken !== null) {
      throw new Conflict(Errors.USERNAME_TAKEN)
    }

    if (!isEmail(email)) {
      throw new BadRequest(Errors.INVALID_EMAIL)
    }

    const emailTaken = await postgres.users.findUserByEmail(email)
    if (emailTaken !== null) {
      throw new Conflict(Errors.EMAIL_TAKEN)
    }

    if (!isPasswordValid(password)) {
      throw new BadRequest(Errors.INVALID_PASSWORD)
    }

    // TODO(Referral): Referral system disabled while legal is in flux. Comment to enable.
    const referrerCode = null
    if (!_(referrerCode).isEmpty()) {
      const referrerCodeValid = await postgres.users.findUserByReferralCode(referrerCode)
      if (referrerCodeValid == null) {
        throw new BadRequest(Errors.INVALID_REFERRER_CODE)
      }
    }

    return {
      id: '',
      address: '',
      email,
      username,
      profPic: '',
      phone: '',
      referral_code: '',
      referrer_id: '',
      accessToken: '',
      refreshToken: '',
    }
  }

  private async signup(
    email: string,
    username: string,
    password: string,
    referralCode?: string,
  ): Promise<AuthModels.AuthResponse> {
    try {
      // TODO(Referral): Referral system disabled while legal is in flux. Replace to enable.
      await this.checkSignup(email, username, password)
    } catch (e) {
      throw e
    }

    const genSaltAsync = promisify(bcrypt.genSalt)
    const salt = await genSaltAsync(SALT_ROUNDS)
    const hashedPassword = await promisify<string, string, Function, string>(bcrypt.hash)(password, salt, null)
    const permalink = username.toLowerCase().replace(' ', '').replace(/[^\w\s]/gi, '').trim()
    const verifyToken = crypto.randomBytes(48).toString('hex')
    const newUser = await postgres.users.addNewUser(
      username,
      email,
      hashedPassword,
      referralCode,
      verifyToken,
      permalink,
    )

    return {
      id: newUser.id,
      address: newUser.address,
      email: newUser.email,
      username: newUser.username,
      profPic: newUser.prof_pic,
      phone: newUser.phone,
      referral_code: newUser.referral_code,
      referrer_id: newUser.referrer_id,
      verifyToken,
      permalink,
      accessToken: '',
      refreshToken: '',
    }
  }

  private initializeSignup() {
    Passport.use(
      'signup',
      new PassportLocal.Strategy({
          usernameField: 'username',
          passwordField: 'password',
          passReqToCallback: true,
        },
        async (req, username, password, done) => {
          const { email } = req.body

          try {
            const user = await this.signup(email, username, password)
            return done(null, user)
          } catch (err) {
            return done(err)
          }
        }),
      )
  }

  private initializeLogin() {
    Passport.use(new ClientPasswordStrategy((clientId, clientSecret, done) =>
      done(null, { id: OAUTH2_STATIC_CLIENT_ID })))

    Passport.use(new BearerStrategy(async (token, done) => {
      const accessToken = await postgres.accessTokens.findToken(token)

      if (!accessToken) {
        return done(null, false)
      } else if (Math.floor(Date.now() / 1000) >= accessToken.expires) {
        await postgres.accessTokens.deleteToken(accessToken.user_id, accessToken.client_id)
        return done(null, false, { message: 'Token expired' })
      }

      const user = await postgres.users.findUser(accessToken.user_id)

      if (!user) {
        return done(null, false, { message: 'Unknown user' })
      } else {
        return done(null, user, {})
      }
    }))
  }
}

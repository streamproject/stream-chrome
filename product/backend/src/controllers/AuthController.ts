import * as Express from 'express'
import * as nodemailer from 'nodemailer'
import * as Passport from 'passport'
import { AuthModels } from 'shared/dist/models'
import * as Errors from 'shared/dist/models/Errors/AuthErrors'
import {
  BodyParams,
  Controller, Get, Next, PathParams,
  Post, Req,
  Request, Res,
} from 'ts-express-decorators'
import { BadRequest } from 'ts-httpexceptions'
import { EMAIL_ACCOUNT, EMAIL_PASS } from '../config'
import * as postgres from '../db/postgres'
import { ExpressBrute } from '../decorators/ExpressBrute'
import { serverInstance } from '../services/OAuthService'
import { PassportLocalService } from '../services/PassportService'

@Controller('/auth')
export class AuthController {

  constructor(
    private passportService: PassportLocalService,
  ) {}

  @Post('/token')
  public async token(
    @Req() request: Express.Request,
    @Res() response: Express.Response,
    @Next() next: Express.NextFunction,
  ) {
    const token = serverInstance.token()
    token(request, response, next)
  }

  @Post('/login')
  @ExpressBrute('login')
  public async login(
    @Req() request: Express.Request,
    @Res() response: Express.Response,
    @Next() next: Express.NextFunction,
  ) {
    await Passport.authenticate(['oauth2-client-password'], { session: false })
    const token = serverInstance.token()
    token(request, response, next)
  }

  @Post('/checkSignup')
  @ExpressBrute('checkSignup')
  public async checkSignup(
    @BodyParams('email') email?: string,
    @BodyParams('username') username?: string,
    @BodyParams('password') password?: string,
  ): Promise<AuthModels.AuthResponse> {
    return this.passportService.checkSignup(email, username, password)
  }

  @Post('/signup')
  // @ExpressBrute('signup')
  public async signup(
    @Request() request: Express.Request,
    @Res() response: Express.Response,
  ) {
    return new Promise((resolve, reject) => {
      Passport.authenticate('signup', { session: false }, (err, user: any) => {
        if (err) {
          reject(err)
          return
        }
        if (!user) {
          reject(Errors.AUTH_ERROR)
          return
        }

        this.sendMail(user.email, user.verify_token, user.permalink)
        resolve(user)
      })(request, response, () => { return })
    })
  }

  @Post('/logout')
  public async logout(
  ): Promise<AuthModels.AuthResponse> {
    // TODO delete user refresh token
    return {
      id: null,
      email: '',
      username: '',
      phone: '',
      profPic: '',
      address: '',
      referral_code: '',
      referrer_id: '',
      accessToken: '',
      refreshToken: '',
    }
  }

  @Get('/verify/:permalink/:token')
  public async verifyEmail(
    @Request() request: Express.Request,
    @Res() response: Express.Response,
    @PathParams('permalink') permalink: string,
    @PathParams('token') token: string,
  ): Promise<{}> {
    const myUser = await postgres.users.findUserByPermalink(permalink)

    if (!myUser) {
      throw new BadRequest('Invalid permalink')
    }

    if (myUser.verify_token !== token) {
      throw new BadRequest('Invalid token')
    }

    await postgres.users.updateUser(myUser.id, { verified: true })

    return {}
  }

  public async sendMail(email, token, permalink) {
    const transporter = nodemailer.createTransport({
      auth: {
        user: EMAIL_ACCOUNT,
        pass: EMAIL_PASS,
      },
    })

    const mailOptions = {
      from: EMAIL_ACCOUNT,
      to: email,
      subject: 'Verify account',
      text: `Token: ${token} Permalink ${permalink}`,
    }

    try {
      await transporter.sendMail(mailOptions)
    } catch (err) {
      throw err
    }
  }
}

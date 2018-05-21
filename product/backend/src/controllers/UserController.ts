import * as bcrypt from 'bcrypt-nodejs'
import * as _ from 'lodash'
import * as phoneFormatter from 'phone'
import * as rp from 'request-promise-native'
import { PlatformModels, UserModels } from 'shared/dist/models'
import * as Errors from 'shared/dist/models/Errors/UserErrors'
import { Authenticated, BodyParams, Controller, Get, PathParams, Post, Put, Required } from 'ts-express-decorators'
import { BadRequest, Conflict, Forbidden, NotFound } from 'ts-httpexceptions'
import { promisify } from 'util'
import { PHONE_SALT_HASH, SALT_ROUNDS, TWILIO_API_KEY } from '../config'
import * as postgres from '../db/postgres'
import DecodedParams from '../decorators/DecodedParams'
import { FAKE_ESCROW_STREAM_USER, TxService } from '../services/TxService'

export const normalizePhoneNumber = (countryCode: string, nationalNumber: string) => {
  return phoneFormatter(countryCode + nationalNumber)[0]
}

// TODO(dli): find a better place to put this.
@Controller('/user')
export class UserController {
  constructor(
    private txService: TxService,
  ) { }

  @Get('/:platformType/:platformId')
  @Authenticated()
  public async findUserByPlatform(
    @Required @PathParams('platformType') platformType: PlatformModels.PlatformTypes,
    @Required @PathParams('platformId') platformId: string,
  ): Promise<UserModels.UserResponse> {
    let user = await postgres.users.findUserByPlatform(platformId, platformType)

    if (user === null) {
      user = FAKE_ESCROW_STREAM_USER
    }

    return UserModels.serializeLimited(user)
  }

  @Get('/me')
  @Authenticated()
  public async getMe(
    @Required @DecodedParams('id') id: string,
  ): Promise<UserModels.UserResponse> {
    const user = await postgres.users.findUser(id)

    if (user === null) {
      throw new NotFound(Errors.INVALID_USER)
    }

    return UserModels.serialize(user)
  }

  @Put('/me')
  @Authenticated()
  public async updateUser(
    @Required @DecodedParams('id') id: string,
    @BodyParams('password') password?: string,
    @BodyParams('address') address?: string,
    @BodyParams('newPassword') newPassword?: string,
    // @BodyParams('profPic') profPic?: string, // TODO: Support updating of other fields.
    // @BodyParams('email') email?: string, // TODO: Support updating of other fields.
    // Phone and Verified can only be updated via the 2auth user flow for security reasons.
  ): Promise<UserModels.UserResponse> {
    const user = await postgres.users.findUser(id)

    if (_(address).isEmpty()) {
      return UserModels.serialize(user) // TODO: Support updating of other fields.
    }

    if (user.address || newPassword) {
      if (_(password).isEmpty()) {
        // We require the password to update the address.
        throw new Forbidden(Errors.INVALID_PASSWORD)
      }

      const isMatch = await promisify<string, string, boolean>(bcrypt.compare)(password, user.password)

      if (!isMatch) {
        throw new Forbidden(Errors.INVALID_PASSWORD)
      }
    }

    if ((!this.txService.web3.utils.isAddress(address))) {
      throw new BadRequest(Errors.INVALID_ADDRESS)
    }

    if (newPassword) {
      const salt = bcrypt.genSaltSync(SALT_ROUNDS)

      password = bcrypt.hashSync(newPassword, salt)
    }

    try {
      const newUser = await postgres.users.updateUser(id, { address, password })
      return UserModels.serialize(newUser)
    } catch (err) {
      throw new BadRequest(Errors.DUPLICATE_ADDRESS)
      // TODO: There can of course, be many other errors here.
    }
  }

  @Post('/verify')
  @Authenticated()
  public async verify(
    @Required @BodyParams('countryCode') countryCode: string,
    @Required @BodyParams('nationalNumber') nationalNumber: string,
    @Required @DecodedParams('id') id: string,
  ): Promise<UserModels.AuthyVerifyResponse > {
    const parameters = {
      api_key: TWILIO_API_KEY,
      country_code: countryCode,
      phone_number: nationalNumber,
      code_length: 6,
      via: 'sms',
    }

    const phone = normalizePhoneNumber(countryCode, nationalNumber)
    const hashedPhone = await promisify<string, string, Function, string>(bcrypt.hash)(phone, PHONE_SALT_HASH, null)
    const isPhoneUnique = await postgres.users.findUserByPhone(hashedPhone)

    if (isPhoneUnique !== null) {
      throw new Conflict(Errors.PHONE_DUPLICATE)
    }

    const user = await postgres.users.findUser(id)
    if (user === null) {
      throw new BadRequest(Errors.INVALID_USER)
    } else if (user.phone !== null) {
      throw new BadRequest(Errors.ALREADY_VERIFIED)
    }

    try {
      const verifyResponse = await rp({
        method: 'POST',
        uri: 'https://api.authy.com/protected/json/phones/verification/start',
        body: parameters,
        json: true,
        resolveWithFullResponse: true,
      })
      return verifyResponse.body
    } catch (error) {
      if (error.error.error_code === '60033') {
        throw new BadRequest(Errors.PHONE_INVALID)
      }
      throw new BadRequest(Errors.VERIFY_FAILED)
    }
  }

@Post('/check')
@Authenticated()
public async check(
  @Required @BodyParams('countryCode') countryCode: string,
  @Required @BodyParams('nationalNumber') nationalNumber: string,
  @Required @BodyParams('verificationCode') verificationCode: string,
  @Required @DecodedParams('id') id: string,
): Promise<UserModels.AuthyCheckResponse> {
    const parameters = {
      api_key: TWILIO_API_KEY,
      country_code: countryCode,
      phone_number: nationalNumber,
      code_length: 6,
      via: 'sms',
      verification_code: verificationCode,
    }
    const phone = normalizePhoneNumber(countryCode, nationalNumber)

    const hashedPhone = await promisify<string, string, Function, string>(bcrypt.hash)(phone, PHONE_SALT_HASH, null)
    const isPhoneUnique = await postgres.users.findUserByPhone(hashedPhone)

    if (isPhoneUnique !== null) {
      throw new Conflict(Errors.PHONE_DUPLICATE)
    }

    const user = await postgres.users.findUser(id)
    if (user === null) {
      throw new BadRequest(Errors.INVALID_USER)
    } else if (user.phone !== null) {
      throw new BadRequest(Errors.ALREADY_VERIFIED)
    }

    try {
      const checkResponse = await rp({
        method: 'GET',
        uri: 'https://api.authy.com/protected/json/phones/verification/check',
        qs: parameters,
        json: true,
        resolveWithFullResponse: true,
      })
      await postgres.users.updateUser(id, { phone: hashedPhone })
      return checkResponse.body
    } catch (error) {
      if (error.error.error_code === '60022') {
        throw new BadRequest(Errors.VERIFY_CODE_INVALID)
      }

      throw new BadRequest(Errors.CHECK_FAILED)
    }
  }

}

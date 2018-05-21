import * as tables from './tables'

export type UserResponse = {
  id: tables.usersFields.id,
  username: tables.usersFields.username,
  email: tables.usersFields.email,
  address: tables.usersFields.address,
  phone: tables.usersFields.phone,
  profPic: tables.usersFields.prof_pic,
  referral_code: tables.usersFields.referral_code,
  referrer_id: tables.usersFields.referrer_id,
  verifyToken?: tables.usersFields.verify_token,
  permalink?: tables.usersFields.permalink,
}

export type AuthyVerifyResponse = {
  carrier: string,
  is_cellphone: boolean,
  message: string,
  seconds_to_expire: number,
  success: boolean,
  uuid: string,
}

export type AuthyCheckResponse = {
  message: string,
  success: boolean,
}

export function serialize(user: tables.users): UserResponse {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    address: user.address,
    profPic: user.prof_pic,
    phone: user.phone,
    referral_code: user.referral_code,
    referrer_id: user.referrer_id,
  }
}

export function serializeLimited(user: tables.users): UserResponse {
  return {
    id: user.id,
    username: user.username,
    email: null,
    address: user.address,
    phone: null,
    profPic: null,
    referral_code: null,
    referrer_id: null,
  }
}

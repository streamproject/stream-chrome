import * as tables from './tables'
import * as UserModels from './UserModels'

export type AuthResponse = UserModels.UserResponse & {
 accessToken: string;
 refreshToken: string;
}

export function serialize(user: tables.users, accessToken: string, refreshToken: string): AuthResponse {
  return {
    ...UserModels.serialize(user),
    accessToken,
    refreshToken,
  }
}

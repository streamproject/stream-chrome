import * as tables from './tables'

export const TWITCH = 'TWITCH'
export const YOUTUBE = 'YOUTUBE'

export type PlatformTypes =  typeof TWITCH | typeof YOUTUBE

export type TwitchUsers = {
  'data': [
    {
      'id': string,
      'login': string,
      'display_name': string,
      'type': string,
      'broadcaster_type': string,
      'description': string,
      'profile_image_url': string,
      'offline_image_url': string
      'view_count': number,
    }
  ],
}

export type YoutubeChannels = {
  etag: string,
  items: Array<{
    kind: string,
    etag: string,
    id: string,
  }>,
  kind: string,
  pageInfo: {
    resultsPerPage: number,
    totalResults: number,
  },
}

export type PlatformsResponse = Array<{
  id: string,
  userId: string,
  platformId: string,
  platformType: string | PlatformTypes,
}>

export function serialize(platforms: tables.platforms[]): PlatformsResponse {
  return platforms.map((platform) => ({
    id: platform.id,
    userId: platform.user_id,
    platformId: platform.platform_id,
    platformType: platform.platform_type,
  }))
}

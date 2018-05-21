import axios from 'axios'
import { format } from 'url'
import { TWITCH_CLIENT_ID } from '../constants/config'

export function isTwitchChannelUrl(url: string) {
  return (new RegExp(
    '^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?twitch\.tv\/.+',
    'i',
  )).test(url)
}

export function getTwitchUsername(url: string) {
  const parts = url.split('/')

  return parts[3]
}

export type TwitchResponse = {
  data: [
    {
      broadcaster_type: string,
      description: string,
      display_name: string,
      id: string,
      login: string,
      offline_image_url: string,
      profile_image_url: string,
      type: string,
      view_count: number,
    }
  ],
}

export async function getTwitchUser(login: string) {
  const requestUrl = format({
    protocol: 'https',
    host: 'api.twitch.tv/helix/users',
    query: {
      login,
    },
  })

  return await axios.get<TwitchResponse>(requestUrl, { headers: { 'Client-ID': TWITCH_CLIENT_ID } })
}

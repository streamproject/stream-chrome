import axios from 'axios'
import { format } from 'url'
import { GOOGLE_API_KEY } from '../constants/config'

export function isYoutubeVideoUrl(url: string) {
  return (new RegExp(
    '^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?youtube\.com/watch.*',
    'i',
  )).test(url)
}

// https://stackoverflow.com/questions/2936467/parse-youtube-video-id-using-preg-match/6382259#6382259
export function getYoutubeVideoId(url: string) {
  const pattern = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i
  const matches = url.match(pattern)

  return matches[1]
}

export type YoutubeResponse = {
 kind: string,
 etag: string,
 pageInfo: {
  totalResults: number,
  resultsPerPage: number,
 },
 items: Array<{
   kind: string,
   etag: string,
   id: string,
   snippet: {
    publishedAt: string,
    channelId: string,
    title: string,
    description: string,
    thumbnails: any,
    channelTitle: string,
    categoryId: string,
    liveBroadcastContent: string,
    localized?: any,
   },
  }>,
}

export async function getYoutubeVideoInfo(videoId: string) {
  const requestUrl = format({
    protocol: 'https',
    host: 'www.googleapis.com/youtube/v3/videos',
    query: {
      id: videoId,
      part: 'snippet',
      key: GOOGLE_API_KEY,
    },
  })

  return await axios.get<YoutubeResponse>(requestUrl)
}

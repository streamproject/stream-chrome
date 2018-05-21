import * as rp from 'request-promise-native'
import { PlatformModels } from 'shared/dist/models'
import * as Errors from 'shared/dist/models/Errors/PlatformErrors'
import { Authenticated, BodyParams, Controller, Delete, Get, PathParams, Post, Required } from 'ts-express-decorators'
import { Conflict } from 'ts-httpexceptions'
import { format } from 'url'
import { GOOGLE_CLIENT_ID, GOOGLE_REDIRECT_URI, GOOGLE_SECRET,
  TWITCH_CLIENT_ID, TWITCH_REDIRECT_URI, TWITCH_SECRET } from '../config'
import * as postgres from '../db/postgres'
import DecodedParams from '../decorators/DecodedParams'

type AccessTokenResponse = {
  access_token: string,
  token_type: string,
  expires_in: number,
  refresh_token: string,
}

// TODO(dli): Handle the case where multiple users control the same channel or the sort.
// TODO: Convert to service
@Controller('/platforms')
export class PlatformsController {

  @Get('/')
  @Authenticated()
  public async getPlatforms(
    @Required @DecodedParams('id') userId: string,
  ): Promise<PlatformModels.PlatformsResponse> {
    const platforms = await postgres.platforms.findPlatformsByUserId(userId)
    return PlatformModels.serialize(platforms)
  }

  @Delete('/:platformId')
  @Authenticated()
  public async deletePlatform(
    @Required @DecodedParams('id') userId: string,
    @Required @PathParams('platformId') platformId: string,
  ): Promise<PlatformModels.PlatformsResponse> {
    const platforms = await postgres.platforms.findPlatformsByUserId(userId)
    const foundPlatform = platforms.find((platform) => platform.platform_id === platformId)

    if (!foundPlatform) {
      throw new Conflict(Errors.OAUTH)
    }

    await postgres.platforms.deletePlatform(platformId)

    return await this.getPlatforms(userId)
  }

  @Post('/twitch')
  @Authenticated()
  public async addTwitch(
    @Required @DecodedParams('id') userId: string,
    @Required @BodyParams('code') code: string,
  ): Promise<PlatformModels.PlatformsResponse> {
    const twitchTokenResponse: AccessTokenResponse = await rp({
      method: 'POST',
      uri: 'https://api.twitch.tv/kraken/oauth2/token' ,
      body: {
        client_id: TWITCH_CLIENT_ID,
        client_secret: TWITCH_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: TWITCH_REDIRECT_URI,
        code,
      },
      json: true,
      // resolveWithFullResponse: true,
    })

    const { access_token: accessToken } = twitchTokenResponse

    const twitchUsers: PlatformModels.TwitchUsers = await rp({
      method: 'GET',
      uri: 'https://api.twitch.tv/helix/users',
      headers: {
        'Client-ID': TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${accessToken}`,
      },
      json: true,
    })

    try {
      await postgres.platforms.addPlatform(userId, twitchUsers.data[0].id, PlatformModels.TWITCH)
      return await this.getPlatforms(userId)
    } catch (err) {
      // https://www.postgresql.org/docs/9.2/static/errcodes-appendix.html
      if (err.code && err.code === '23505') {
        throw new Conflict(Errors.DUPLICATE_PLATFORM)
      }

      throw err
    }
  }

  @Post('/youtube')
  @Authenticated()
  public async addYoutubeChannels(
    @Required @DecodedParams('id') userId: string,
    @Required @BodyParams('code') code: string,
  ): Promise<PlatformModels.PlatformsResponse> {
    const accessTokenUri = format({
      protocol: 'https',
      host: 'www.googleapis.com/oauth2/v4/token' ,
      query: {
        client_id: GOOGLE_CLIENT_ID,
        redirect_uri: GOOGLE_REDIRECT_URI,
        client_secret: GOOGLE_SECRET,
        code,
        grant_type: 'authorization_code',
      },
    })

    const accessTokenResponse: AccessTokenResponse = await rp({
      method: 'POST',
      uri: accessTokenUri,
      json: true,
    })

    const uri = format({
      protocol: 'https',
      host: 'www.googleapis.com/youtube/v3/channels' ,
      query: {
        part: 'id',
        mine: 'true',
      },
    })

    const youtubeChannels: PlatformModels.YoutubeChannels = await rp({
      method: 'GET',
      uri,
      headers: {
        Authorization: `Bearer ${accessTokenResponse.access_token}`,
      },
      json: true,
    })

    try {
      await Promise.all(youtubeChannels.items.map(({ id: platformId }) => {
        return postgres.platforms.addPlatform(userId, platformId, PlatformModels.YOUTUBE)
      }))
      return await this.getPlatforms(userId)
    } catch (err) {
      // https://www.postgresql.org/docs/9.2/static/errcodes-appendix.html
      if (err.code && err.code === '23505') {
        throw new Conflict(Errors.DUPLICATE_PLATFORM)
      }

      throw err
    }
  }
}

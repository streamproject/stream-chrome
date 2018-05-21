import { PlatformModels } from 'shared/dist/models'
import { Authenticated, BodyParams, Controller, Post, Required } from 'ts-express-decorators'
import * as postgres from '../db/postgres'
import DecodedParams from '../decorators/DecodedParams'
import { ExpressBrute } from '../decorators/ExpressBrute'

@Controller('/tracking')
export class TrackingController {

  @Post('/view')
  @Authenticated()
  @ExpressBrute('tracking')
  public async get(
    @Required @DecodedParams('id') userId: string,
    @Required @BodyParams('videoUrl') videoUrl: string,
    @Required @BodyParams('videoId') videoId: string,
    @Required @BodyParams('platformId') platformId: string,
    @Required @BodyParams('platformType') platformType: PlatformModels.PlatformTypes,
  ) {
    return await postgres.views.addNewView(userId, videoUrl, videoId, platformId, platformType)
  }
}

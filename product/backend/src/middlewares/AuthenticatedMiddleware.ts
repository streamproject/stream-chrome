import * as Express from 'express'
import * as Passport from 'passport'
import {
  AuthenticatedMiddleware, EndpointInfo, EndpointMetadata,
  Next, OverrideMiddleware, Request,
} from 'ts-express-decorators'
import { Unauthorized } from 'ts-httpexceptions'

@OverrideMiddleware(AuthenticatedMiddleware)
export default class AuthorizeMiddleware extends AuthenticatedMiddleware {
  public async use(
    @EndpointInfo() endpoint: EndpointMetadata,
    @Request() request: Express.Request,
    @Next() next: Express.NextFunction,
  ) {
    await Passport.authenticate('bearer', (err, user, info) => {
      if (err) {
        next(new Unauthorized(err))
        return

      }

      if (!user) {
        next(new Unauthorized(info))
        return
      }

      request.decoded = { id: user.id }
      next()
    })(request, null, () => { return })
  }
}

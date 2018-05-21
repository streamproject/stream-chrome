import * as Express from 'express'
import { IMiddleware, Middleware, Next, Response } from 'ts-express-decorators'

@Middleware()
export default class ResponseHeadersMiddleware implements IMiddleware {
  public use(
    @Response() response: Express.Response,
    @Next() next: Express.NextFunction,
  ): any {
    response.header('X-FRAME-OPTIONS', 'DENY')
    response.header('Access-Control-Allow-Origin', '*')
    response.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept',
    )

    next()
  }
}

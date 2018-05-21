import * as Express from 'express'
import { EndpointInfo, EndpointMetadata, IMiddleware, Inject, Middleware,
  Next, Request, Response } from 'ts-express-decorators'
import { ExpressBruteService } from '../services/ExpressBruteService'

@Middleware()
export default class ExpressBruteMiddleware implements IMiddleware {
  public constructor(
    @Inject(ExpressBruteService) private expressBruteService: ExpressBruteService,
  ) { }

  public use(
    @Request() request: Express.Request,
    @EndpointInfo() endpoint: EndpointMetadata,
    @Response() response: Express.Response,
    @Next() next: Express.NextFunction,
  ) {
    const { bruteType } = endpoint.get(ExpressBruteMiddleware)
    const bruteforce = this.expressBruteService.getBruteforce(bruteType)
    return bruteforce(request, response, next)
  }
}

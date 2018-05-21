import * as Express from 'express'
import * as ExpressBrute from 'express-brute'
import ExpressBruteRedis = require('express-brute-redis')
import { CrxErrors } from 'shared/dist/models/Errors'
import { Service } from 'ts-express-decorators'
import { TooManyRequests } from 'ts-httpexceptions'
import { REDIS_HOST, REDIS_PORT } from '../config'

export type BruteType = 'default' | 'user' | 'login' | 'tracking' | 'signup' | 'checkSignup'

@Service()
export class ExpressBruteService  {
  public store: ExpressBruteRedis

  private globalBruteforce: Express.RequestHandler
  private userBruteforce: Express.RequestHandler
  private loginBruteforce: Express.RequestHandler
  private signupBruteforce: Express.RequestHandler
  private checkSignupBruteforce: Express.RequestHandler
  private trackingBruteforce: Express.RequestHandler

  constructor() {
    this.store = new ExpressBruteRedis({
      host: REDIS_HOST,
      port: REDIS_PORT,
    })

    const failCallback = (req, res, next) => {
      next(new TooManyRequests(CrxErrors.TOO_MANY_TRIES))
    }

    this.globalBruteforce = new ExpressBrute(this.store, { failCallback }).prevent

    this.userBruteforce = new ExpressBrute(this.store, {
      failCallback,
    }).getMiddleware({
      key(req, res, next) {
        next(req.headers.authorization)
      },
      failCallback,
      ignoreIP: false,
    })

    this.loginBruteforce = new ExpressBrute(this.store, {
      freeRetries: 3,
      failCallback,
    }).prevent

    // 3 signups per day
    this.signupBruteforce = new ExpressBrute(this.store, {
      freeRetries: 3,
      minWait: 25 * 60 * 60 * 1000,
      maxWait: 25 * 60 * 60 * 1000,
      lifetime: 60 * 60 * 24,
      failCallback,
    }).prevent

    // 250 calls to checkSignup per day before throttling starts at 500ms.
    this.checkSignupBruteforce = new ExpressBrute(this.store, {
      freeRetries: 250,
      minWait: 500,
      maxWait: 15 * 60 * 1000,
      lifetime: 60 * 60 * 24,
      failCallback,
    }).prevent

    // Throttled to 10s
    this.trackingBruteforce = new ExpressBrute(this.store, {
      freeRetries: 0,
      minWait: 1000 * 10,
      maxWait: 1000 * 10,
      lifetime: 10,
    }).getMiddleware({
      key(req, res, next) {
        next(req.headers.authorization)
      },
      failCallback,
      ignoreIP: false,
    })
  }

  public getBruteforce(bruteType: BruteType) {
    switch (bruteType) {
      case 'user':
        return this.userBruteforce
      case 'login':
        return this.loginBruteforce
      case 'signup':
        return this.signupBruteforce
      case 'checkSignup':
        return this.checkSignupBruteforce
      case 'default':
        return this.globalBruteforce
      case 'tracking':
        return this.trackingBruteforce
    }
  }
}

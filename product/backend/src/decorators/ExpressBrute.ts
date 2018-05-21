import { Store, UseBefore } from 'ts-express-decorators'
import ExpressBruteMiddleware from '../middlewares/ExpressBruteMiddleware'
import { BruteType } from '../services/ExpressBruteService'

// This cannot be called by controllers, only endpoints.
// See https://github.com/Romakita/ts-express-decorators/issues/250
export function ExpressBrute(bruteType: BruteType) {
  return Store.decorate((store) => {
    store.set(ExpressBruteMiddleware, { bruteType })
    return UseBefore(ExpressBruteMiddleware)
  })
}

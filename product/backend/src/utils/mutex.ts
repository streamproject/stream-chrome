import Mutis = require('mutis')
import * as redis from 'redis'
import { REDIS_HOST, REDIS_PORT } from '../config'

const MUTEX_TTL = 20
const redisClient = redis.createClient({
  host: REDIS_HOST,
  port: REDIS_PORT,
})
const mutex = new Mutis(redisClient)

export default class Mutex {
  public async lock(userId: string, endpoint: string) {
    const key = `${userId}_${endpoint.replace('/', '_')}`

    return mutex.lock(key, MUTEX_TTL)
  }

  public async unlock(userId: string, endpoint: string) {
    const key = `${userId}_${endpoint.replace('/', '_')}`

    return mutex.unlock(key)
  }
}

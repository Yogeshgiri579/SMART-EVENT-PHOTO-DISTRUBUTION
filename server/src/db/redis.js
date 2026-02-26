import Redis from 'ioredis'
import { config } from '../config/index.js'

let redis = null

export function getRedis() {
  if (!redis) {
    redis = new Redis(config.redisUrl, { maxRetriesPerRequest: null })
  }
  return redis
}

export async function disconnectRedis() {
  if (redis) {
    await redis.quit()
    redis = null
  }
}

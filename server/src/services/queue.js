import { Queue, Worker } from 'bullmq'
import { getRedis } from '../db/redis.js'

const connection = { host: 'localhost', port: 6379 }

function getConnection() {
  const url = process.env.REDIS_URL || 'redis://localhost:6379'
  try {
    const u = new URL(url)
    return {
      host: u.hostname,
      port: parseInt(u.port || '6379', 10),
      password: u.password || undefined,
    }
  } catch {
    return { host: 'localhost', port: 6379 }
  }
}

const conn = getConnection()

export const photoMatchQueue = new Queue('photo-match', {
  connection: conn,
  defaultJobOptions: {
    removeOnComplete: { count: 1000 },
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  },
})

export function addPhotoMatchJob(eventId, photoId, s3Key) {
  return photoMatchQueue.add('match', { eventId, photoId, s3Key })
}

export function getPhotoMatchWorker(handler) {
  return new Worker('photo-match', handler, {
    connection: conn,
    concurrency: 5,
  })
}

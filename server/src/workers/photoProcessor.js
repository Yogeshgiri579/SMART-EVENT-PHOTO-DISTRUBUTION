import '../config/index.js'
import mongoose from 'mongoose'
import { connectMongo } from '../db/mongoose.js'
import { getPhotoMatchWorker } from '../services/queue.js'
import { getSignedGetUrl } from '../services/s3.js'
import { detectFacesFromUrl } from '../services/faceService.js'
import { Photo } from '../models/Photo.js'
import { EventFace } from '../models/EventFace.js'
import { v4 as uuidv4 } from 'uuid'

async function processPhotoMatch(job) {
  const { eventId, photoId, s3Key } = job.data
  if (!eventId || !photoId || !s3Key) {
    throw new Error('Missing eventId, photoId or s3Key')
  }

  let imageUrl
  try {
    imageUrl = await getSignedGetUrl(s3Key, 3600) // Valid for 1 hour
  } catch (e) {
    await Photo.updateOne(
      { _id: photoId },
      { $set: { indexingStatus: 'failed' } }
    )
    throw e
  }

  try {
    const faces = await detectFacesFromUrl(imageUrl)
    
    // For each detected face, we store the embedding in EventFaces
    for (const face of faces) {
      if (!face.embedding || face.embedding.length === 0) continue;
      
      await EventFace.create({
        eventId: new mongoose.Types.ObjectId(eventId),
        imageUrl: s3Key, // Store the raw s3Key to generate fresh URLs dynamically during search
        photoId: new mongoose.Types.ObjectId(photoId), // Optionally link back to photo
        faceId: uuidv4(),
        embedding: face.embedding
      })
    }
  } catch (e) {
    console.error(`Error processing faces for photo ${photoId}:`, e.message);
    await Photo.updateOne(
      { _id: photoId },
      { $set: { indexingStatus: 'failed' } }
    )
    throw e
  }

  await Photo.updateOne(
    { _id: photoId },
    { $set: { indexingStatus: 'indexed' } }
  )
}


async function main() {
  await connectMongo()

  const worker = getPhotoMatchWorker(async (job) => {
    await processPhotoMatch(job)
  })

  worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed`)
  })
  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed:`, err?.message)
  })

  console.log('MomentDrop photo worker running (photo-match queue)')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

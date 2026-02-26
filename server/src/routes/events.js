import { Router } from 'express'
import multer from 'multer'
import { authMiddleware, attachUser } from '../middleware/auth.js'
import { Event } from '../models/Event.js'
import { EventAttendee } from '../models/EventAttendee.js'
import { EventFace } from '../models/EventFace.js'
import { uploadBuffer, getSignedGetUrl, getExternalSignedGetUrl } from '../services/s3.js'
import { addPhotoMatchJob } from '../services/queue.js'
import { detectFacesFromUrl } from '../services/faceService.js'
import { computeCosineSimilarity } from '../services/vectorSimilarity.js'
import { Photo } from '../models/Photo.js'
import { v4 as uuidv4 } from 'uuid'

const router = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } })

// Public route to get event details
router.get('/:eventId', async (req, res, next) => {
  try {
    const event = await Event.findOne({ _id: req.params.eventId }).lean()
    if (!event) return res.status(404).json({ message: 'Event not found' })
    const attendeeCount = await EventAttendee.countDocuments({ eventId: event._id })

    const organizerId = event.organizerId
      ? (event.organizerId.toString ? event.organizerId.toString() : String(event.organizerId))
      : null

    res.json({
      event: {
        ...event,
        id: event._id.toString(),
        organizerId,
        attendeeCount,
      },
    })
  } catch (e) {
    next(e)
  }
})

router.use(authMiddleware)
router.use(attachUser)

router.get('/', async (req, res, next) => {
  try {
    const attended = await EventAttendee.find({ userId: req.userId })
      .distinct('eventId')
      .lean()
    const events = await Event.find({})
      .lean()
      .then((list) =>
        Promise.all(
          list.map(async (e) => {
            const attendeeCount = await EventAttendee.countDocuments({ eventId: e._id })
            return { ...e, id: e._id.toString(), attendeeCount }
          })
        )
      )
    res.json({ events })
  } catch (e) {
    next(e)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { name, description } = req.body
    const event = await Event.create({
      name: name || 'Untitled Event',
      description: description || '',
      organizerId: req.userId,
    })
    const e = event.toObject()
    res.status(201).json({
      event: {
        ...e,
        id: e._id.toString(),
        organizerId: e.organizerId ? e.organizerId.toString() : null
      }
    })
  } catch (e) {
    next(e)
  }
})



router.patch('/:eventId', async (req, res, next) => {
  try {
    const event = await Event.findOne({ _id: req.params.eventId })
    if (!event) return res.status(404).json({ message: 'Event not found' })
    if (String(event.organizerId) !== String(req.userId)) {
      return res.status(403).json({ message: 'Not the organizer' })
    }
    if (req.body.name != null) event.name = req.body.name
    if (req.body.description != null) event.description = req.body.description
    await event.save()
    res.json({ event: event.toObject() })
  } catch (e) {
    next(e)
  }
})

router.delete('/:eventId', async (req, res, next) => {
  try {
    const event = await Event.findOne({ _id: req.params.eventId })
    if (!event) return res.status(404).json({ message: 'Event not found' })
    if (String(event.organizerId) !== String(req.userId)) {
      return res.status(403).json({ message: 'Not the organizer' })
    }
    await event.deleteOne()
    res.status(204).send()
  } catch (e) {
    next(e)
  }
})

router.get('/:eventId/attendees/me', async (req, res, next) => {
  try {
    const reg = await EventAttendee.findOne({
      eventId: req.params.eventId,
      userId: req.userId,
    }).lean()
    res.json({ registered: !!reg })
  } catch (e) {
    next(e)
  }
})

router.post('/:eventId/attendees', upload.single('selfie'), async (req, res, next) => {
  try {
    const event = await Event.findOne({ _id: req.params.eventId })
    if (!event) return res.status(404).json({ message: 'Event not found' })
    const file = req.file
    if (!file || !file.buffer) return res.status(400).json({ message: 'Selfie image required' })

    const existing = await EventAttendee.findOne({
      eventId: event._id,
      userId: req.userId,
    })
    if (existing) return res.status(400).json({ message: 'Already registered for this event' })

    // Require explicit consent
    if (req.body.processingConsent !== 'true' && req.body.processingConsent !== true) {
      return res.status(403).json({ message: 'Explicit consent is required for facial recognition' });
    }

    const key = `events/${event._id}/attendees/${req.userId}/${uuidv4()}.jpg`
    await uploadBuffer(key, file.buffer, file.mimetype || 'image/jpeg')

    let faceId = null;
    let embedding = undefined;

    try {
      const url = await getSignedGetUrl(key);
      const faces = await detectFacesFromUrl(url);
      if (faces && faces.length > 0) {
        embedding = faces[0].embedding;
        faceId = uuidv4();
      } else {
        return res.status(400).json({ message: 'No face detected in the selfie' });
      }
    } catch (e) {
      console.warn('Face detection failed:', e.message);
      return res.status(500).json({ message: 'Failed to process face from image' });
    }

    await EventAttendee.create({
      eventId: event._id,
      userId: req.userId,
      faceId,
      embedding,
      selfieKey: key,
      processingConsent: true
    })
    res.status(201).json({ message: 'Registered successfully' })
  } catch (e) {
    next(e)
  }
})

router.put('/:eventId/attendees/me', upload.single('selfie'), async (req, res, next) => {
  try {
    const event = await Event.findOne({ _id: req.params.eventId })
    if (!event) return res.status(404).json({ message: 'Event not found' })
    const file = req.file
    if (!file || !file.buffer) return res.status(400).json({ message: 'Selfie image required' })

    const attendee = await EventAttendee.findOne({
      eventId: event._id,
      userId: req.userId,
    })
    if (!attendee) return res.status(404).json({ message: 'Not registered for this event' })

    // Update consent if provided
    if (req.body.processingConsent === 'true' || req.body.processingConsent === true) {
      attendee.processingConsent = true;
    }

    const key = `events/${event._id}/attendees/${req.userId}/${uuidv4()}.jpg`
    await uploadBuffer(key, file.buffer, file.mimetype || 'image/jpeg')

    let faceId = attendee.faceId;
    let embedding = undefined;

    try {
      const url = await getSignedGetUrl(key);
      const faces = await detectFacesFromUrl(url);
      if (faces && faces.length > 0) {
        embedding = faces[0].embedding;
        if (!faceId) faceId = uuidv4();
      } else {
        return res.status(400).json({ message: 'No face detected in the selfie' });
      }
    } catch (e) {
      console.warn('Face detection failed:', e.message);
      return res.status(500).json({ message: 'Failed to process face from image' });
    }

    attendee.faceId = faceId
    attendee.embedding = embedding
    attendee.selfieKey = key
    await attendee.save()

    res.json({ message: 'Selfie updated successfully' })
  } catch (e) {
    next(e)
  }
})

router.post('/:eventId/photos', upload.single('photo'), async (req, res, next) => {
  try {
    const event = await Event.findOne({ _id: req.params.eventId })
    if (!event) return res.status(404).json({ message: 'Event not found' })
    if (String(event.organizerId) !== String(req.userId)) {
      return res.status(403).json({ message: 'Not the organizer' })
    }
    const file = req.file
    if (!file || !file.buffer) return res.status(400).json({ message: 'Photo required' })

    const key = `events/${event._id}/photos/${uuidv4()}.jpg`
    await uploadBuffer(key, file.buffer, file.mimetype || 'image/jpeg')
    const photo = await Photo.create({
      eventId: event._id,
      s3Key: key,
      indexingStatus: 'pending',
    })
    await addPhotoMatchJob(event._id.toString(), photo._id.toString(), key)
    let photoUrl = await getExternalSignedGetUrl(key)
    res.status(201).json({ photo: { _id: photo._id, url: photoUrl } })
  } catch (e) {
    next(e)
  }
})

router.post('/:eventId/photos/batch', upload.array('photos', 500), async (req, res, next) => {
  try {
    const event = await Event.findOne({ _id: req.params.eventId })
    if (!event) return res.status(404).json({ message: 'Event not found' })
    if (String(event.organizerId) !== String(req.userId)) {
      return res.status(403).json({ message: 'Not the organizer' })
    }

    const files = req.files || []
    console.log(`Received ${files.length} files for batch upload`)

    if (files.length === 0) {
      return res.status(400).json({ message: 'No photos provided' })
    }

    const created = []
    for (const file of files) {
      if (!file || !file.buffer) {
        console.warn('Skipping file without buffer')
        continue
      }
      try {
        const key = `events/${event._id}/photos/${uuidv4()}.jpg`
        await uploadBuffer(key, file.buffer, file.mimetype || 'image/jpeg')
        const photo = await Photo.create({
          eventId: event._id,
          s3Key: key,
          indexingStatus: 'pending',
        })
        await addPhotoMatchJob(event._id.toString(), photo._id.toString(), key)
        let photoUrl = await getExternalSignedGetUrl(key)
        created.push({ _id: photo._id, url: photoUrl })
      } catch (fileError) {
        console.error('Error processing file:', fileError)
        // Continue with other files
      }
    }

    if (created.length === 0) {
      return res.status(500).json({ message: 'Failed to upload any photos' })
    }

    res.status(201).json({ photos: created, count: created.length })
  } catch (e) {
    console.error('Batch upload error:', e)
    next(e)
  }
})

router.get('/:eventId/photos', async (req, res, next) => {
  try {
    const event = await Event.findOne({ _id: req.params.eventId })
    if (!event) return res.status(404).json({ message: 'Event not found' })
    const isOrganizer = String(event.organizerId) === String(req.userId)
    if (!isOrganizer) return res.status(403).json({ message: 'Organizer only' })

    const photos = await Photo.find({ eventId: event._id }).lean()
    const withUrls = await Promise.all(
      photos.map(async (p) => {
        let url = await getExternalSignedGetUrl(p.s3Key)
        return {
          ...p,
          url,
        }
      })
    )
    res.json({ photos: withUrls })
  } catch (e) {
    next(e)
  }
})

router.get('/:eventId/jobs', async (req, res, next) => {
  try {
    const event = await Event.findOne({ _id: req.params.eventId })
    if (!event) return res.status(404).json({ message: 'Event not found' })
    if (String(event.organizerId) !== String(req.userId)) {
      return res.status(403).json({ message: 'Not the organizer' })
    }
    const pending = await Photo.countDocuments({
      eventId: event._id,
      indexingStatus: 'pending',
    })
    const completed = await Photo.countDocuments({
      eventId: event._id,
      indexingStatus: 'indexed',
    })
    const failed = await Photo.countDocuments({
      eventId: event._id,
      indexingStatus: 'failed',
    })
    res.json({ pending, completed, failed })
  } catch (e) {
    next(e)
  }
})

router.get('/:eventId/my-photos', async (req, res, next) => {
  try {
    const event = await Event.findOne({ _id: req.params.eventId })
    if (!event) return res.status(404).json({ message: 'Event not found' })

    // Check if the user is registered for the event
    const attendee = await EventAttendee.findOne({
      eventId: event._id,
      userId: req.userId,
    }).select('+embedding')
    if (!attendee) return res.status(403).json({ message: 'Not registered for this event' })
    if (!attendee.embedding || attendee.embedding.length === 0) {
      return res.status(400).json({ message: 'No selfie embedding found for your registration. Please update your selfie.' })
    }

    // Perform vector search manually in Node.js
    const allFaces = await EventFace.find({ eventId: event._id }).select('+embedding').lean();

    const results = [];
    for (const face of allFaces) {
      if (!face.embedding || face.embedding.length === 0) continue;
      const score = computeCosineSimilarity(attendee.embedding, face.embedding);
      // Lower threshold to 0.60 since Facenet cosine distance threshold is ~0.40 (similarity >= 0.60)
      if (score >= 0.60) {
        let finalUrl = await getExternalSignedGetUrl(face.imageUrl);
        results.push({
          imageUrl: finalUrl,
          score: score
        });
      }
    }

    // Sort descending by score
    results.sort((a, b) => b.score - a.score);
    // Limit to top 20
    const limitedResults = results.slice(0, 20);

    res.json({ matches: limitedResults });
  } catch (e) {
    next(e)
  }
})

router.delete('/:eventId/embeddings/me', async (req, res, next) => {
  try {
    const attendee = await EventAttendee.findOne({
      eventId: req.params.eventId,
      userId: req.userId,
    })
    if (!attendee) return res.status(404).json({ message: 'Not registered for this event' })

    attendee.embedding = undefined;
    attendee.faceId = null;
    attendee.processingConsent = false;
    await attendee.save();

    res.json({ message: 'Face data removed successfully' })
  } catch (e) {
    next(e)
  }
})

router.delete('/:eventId/attendees/me', async (req, res, next) => {
  try {
    const attendee = await EventAttendee.findOne({
      eventId: req.params.eventId,
      userId: req.userId,
    })
    if (!attendee) return res.status(404).json({ message: 'Not registered for this event' })

    await EventAttendee.deleteOne({ _id: attendee._id })

    res.json({ message: 'Unregistered successfully' })
  } catch (e) {
    next(e)
  }
})

export default router

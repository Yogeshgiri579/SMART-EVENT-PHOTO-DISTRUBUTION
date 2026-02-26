import { Router } from 'express'
import { authMiddleware, attachUser } from '../middleware/auth.js'
import { PhotoDelivery } from '../models/PhotoDelivery.js'
import { Photo } from '../models/Photo.js'
import { getSignedGetUrl } from '../services/s3.js'

const router = Router()
router.use(authMiddleware)
router.use(attachUser)

router.get('/my-photos', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 24))
    const eventId = req.query.eventId || null
    const skip = (page - 1) * limit

    const filter = { userId: req.userId }
    if (eventId) filter.eventId = eventId

    const [deliveries, total] = await Promise.all([
      PhotoDelivery.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      PhotoDelivery.countDocuments(filter),
    ])

    const withUrls = await Promise.all(
      deliveries.map(async (d) => {
        const photo = await Photo.findById(d.photoId).lean()
        let photoUrl = photo ? await getSignedGetUrl(photo.s3Key) : null
        if (photoUrl && photoUrl.includes('http://minio:9000')) {
          photoUrl = photoUrl.replace('http://minio:9000', 'http://localhost:9000')
        }
        return {
          _id: d._id,
          photoId: d.photoId,
          eventId: d.eventId,
          photoUrl,
          matchedAt: d.createdAt,
        }
      })
    )

    const totalPages = Math.ceil(total / limit)
    res.json({
      deliveries: withUrls,
      page,
      limit,
      total,
      totalPages,
    })
  } catch (e) {
    next(e)
  }
})

router.get('/my-photos/event/:eventId', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 24))
    const skip = (page - 1) * limit

    const [deliveries, total] = await Promise.all([
      PhotoDelivery.find({
        userId: req.userId,
        eventId: req.params.eventId,
      })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PhotoDelivery.countDocuments({
        userId: req.userId,
        eventId: req.params.eventId,
      }),
    ])

    const withUrls = await Promise.all(
      deliveries.map(async (d) => {
        const photo = await Photo.findById(d.photoId).lean()
        let photoUrl = photo ? await getSignedGetUrl(photo.s3Key) : null
        if (photoUrl && photoUrl.includes('http://minio:9000')) {
          photoUrl = photoUrl.replace('http://minio:9000', 'http://localhost:9000')
        }
        return {
          _id: d._id,
          photoId: d.photoId,
          eventId: d.eventId,
          photoUrl,
          matchedAt: d.createdAt,
        }
      })
    )

    res.json({
      deliveries: withUrls,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    })
  } catch (e) {
    next(e)
  }
})

export default router

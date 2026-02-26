import mongoose from 'mongoose'

const photoDeliverySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    photoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Photo', required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  },
  { timestamps: true }
)

photoDeliverySchema.index({ userId: 1, eventId: 1 })
photoDeliverySchema.index({ userId: 1 })
photoDeliverySchema.index({ photoId: 1, userId: 1 }, { unique: true })

export const PhotoDelivery = mongoose.model('PhotoDelivery', photoDeliverySchema)

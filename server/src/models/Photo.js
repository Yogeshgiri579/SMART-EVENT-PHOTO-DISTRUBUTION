import mongoose from 'mongoose'

const photoSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    s3Key: { type: String, required: true },
    rekognitionFaceIds: [{ type: String }],
    indexingStatus: { type: String, enum: ['pending', 'indexed', 'failed'], default: 'pending' },
  },
  { timestamps: true }
)

photoSchema.index({ eventId: 1 })
photoSchema.index({ eventId: 1, indexingStatus: 1 })

export const Photo = mongoose.model('Photo', photoSchema)

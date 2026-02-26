import mongoose from 'mongoose'

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
)

eventSchema.index({ organizerId: 1 })

export const Event = mongoose.model('Event', eventSchema)

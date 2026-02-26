import mongoose from 'mongoose'

const eventAttendeeSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    faceId: { type: String, default: null },
    embedding: {
      type: [Number],
      default: undefined,
      select: false  // DO NOT expose embedding arrays in API responses
    },
    processingConsent: { type: Boolean, required: true, default: false },
    selfieKey: { type: String, default: null },
  },
  { timestamps: true }
)

eventAttendeeSchema.index({ eventId: 1, userId: 1 }, { unique: true })
eventAttendeeSchema.index({ eventId: 1 })

export const EventAttendee = mongoose.model('EventAttendee', eventAttendeeSchema)

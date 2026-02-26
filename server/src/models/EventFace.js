import mongoose from 'mongoose'

const eventFaceSchema = new mongoose.Schema(
  {
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    imageUrl: { type: String, required: true },
    faceId: { type: String, required: true },
    embedding: { 
      type: [Number], 
      required: true,
      select: false  // DO NOT expose embedding arrays in API responses
    },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
)

// Index for filtering by eventId efficiently
eventFaceSchema.index({ eventId: 1 })

// Performance warning:
// Manual cosine similarity is O(n), mapping embeddings in memory.
// Works fine for small-to-medium events (< 5,000 embeddings per event locally).
// For scale > 50,000 embeddings, it is recommended to implement a local vector DB 
// container such as Qdrant or Milvus. (Do NOT implement unless required)

export const EventFace = mongoose.model('EventFace', eventFaceSchema)

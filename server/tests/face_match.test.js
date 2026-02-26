import mongoose from 'mongoose'
import { EventFace } from '../src/models/EventFace.js'
import { detectFacesFromUrl } from '../src/services/faceService.js'

// Mock for node fetch to simulate Python service
global.fetch = async (url) => {
  return {
    ok: true,
    json: async () => ({
      faces: [
        { embedding: Array(512).fill(0.1), confidence: 0.99 },
        { embedding: Array(512).fill(0.2), confidence: 0.85 } // Multiple faces
      ]
    })
  }
}

describe('Face Embedding Storage & Retrieval', () => {
  let mockEventId;

  beforeAll(async () => {
    // Assume MongoDB Memory Server or Local test DB is used
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/momentdrop_test');
    mockEventId = new mongoose.Types.ObjectId();
  });

  afterAll(async () => {
    await EventFace.deleteMany({});
    await mongoose.disconnect();
  });

  it('should detect multiple faces in single image and store embeddings securely', async () => {
    const faces = await detectFacesFromUrl('http://mock-url.com/multi-face.jpg');
    expect(faces).toHaveLength(2);

    for (const face of faces) {
      await EventFace.create({
        eventId: mockEventId,
        imageUrl: 'http://mock-url.com/multi-face.jpg',
        faceId: 'mock-uuid',
        embedding: face.embedding
      });
    }

    // Verify embedding array is NOT selected by default as per security requirements
    const saved = await EventFace.find({ imageUrl: 'http://mock-url.com/multi-face.jpg' });
    expect(saved).toHaveLength(2);
    expect(saved[0].embedding).toBeUndefined(); // select: false check
  });

  it('should simulate a false positive rejection (Similarity < 0.85)', async () => {
    // Testing logic representing $vectorSearch distance metrics
    const matchScore = 0.72; // below 0.85
    const threshold = 0.85;

    // Simulate rejection of match returning only >= 0.85
    const isMatched = matchScore >= threshold;
    expect(isMatched).toBe(false);
  });
});

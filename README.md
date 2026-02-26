# MomentDrop – Smart Event Photo Distribution

MERN app that uses **facial recognition** (AWS Rekognition) to deliver event photos to attendees. Uses **local Redis** (Docker) for job queues and supports **MinIO** (Docker) for free S3-compatible storage.

## Prerequisites

- Node.js 18+
- Docker Desktop (for Redis, and optionally MinIO)
- MongoDB (local or [Atlas free tier](https://www.mongodb.com/cloud/atlas))
- AWS account (free tier) for Rekognition: [AWS Rekognition Free Tier](https://aws.amazon.com/rekognition/pricing/) – 5,000 images/month for 12 months

## Quick start

### 1. Start Redis (and optionally MinIO)

```bash
docker compose up -d
```

- Redis: `localhost:6379`
- MinIO: API `http://localhost:9000`, Console `http://localhost:9001` (create bucket `momentdrop`)

### 2. Backend

```bash
cd server
cp ../.env.example .env
# Edit .env: set MONGODB_URI, REDIS_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET
# For MinIO: S3_ENDPOINT=http://localhost:9000, S3_BUCKET=momentdrop, S3_ACCESS_KEY=minioadmin, S3_SECRET_KEY=minioadmin
# For Rekognition: AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION

npm install
npm run dev
```

In another terminal, start the photo worker:

```bash
cd server
npm run worker
```

### 3. Frontend

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173

## Scripts

| Where    | Command        | Description              |
|----------|----------------|--------------------------|
| server   | `npm run dev`   | Run API (with watch)     |
| server   | `npm run start` | Run API (production)     |
| server   | `npm run worker`| Run BullMQ photo worker  |
| client   | `npm run dev`   | Run Vite dev server      |
| client   | `npm run build` | Build for production     |

## Flow

1. **Organizer** creates an event → Rekognition collection is created for that event.
2. **Attendees** register with a selfie → face is indexed in the event collection (ExternalImageId = userId).
3. **Organizer** uploads event photos → stored in S3/MinIO, one job per photo is queued (BullMQ).
4. **Worker** processes each job: loads photo from S3/MinIO, calls Rekognition `SearchFacesByImage` against the event collection, creates `PhotoDelivery` for each matched attendee.
5. **Attendees** open “My photos” → paginated list of delivered photos (signed URLs).

## Env (server)

| Variable            | Description                          |
|---------------------|--------------------------------------|
| `MONGODB_URI`       | MongoDB connection string            |
| `REDIS_URL`         | Redis URL (e.g. `redis://localhost:6379`) |
| `JWT_ACCESS_SECRET` | Min 32 chars                         |
| `JWT_REFRESH_SECRET`| Min 32 chars                         |
| `AWS_REGION`        | e.g. `us-east-1`                     |
| `AWS_ACCESS_KEY_ID` | For Rekognition (and S3 if used)     |
| `AWS_SECRET_ACCESS_KEY` | For Rekognition (and S3 if used) |
| `S3_ENDPOINT`       | MinIO: `http://localhost:9000`      |
| `S3_BUCKET`         | e.g. `momentdrop`                    |
| `S3_ACCESS_KEY`     | MinIO: `minioadmin`                  |
| `S3_SECRET_KEY`     | MinIO: `minioadmin`                  |

If AWS credentials are not set, Rekognition is skipped (attendees can still register and photos upload; matching will not run). Use MinIO for fully free storage; use AWS S3 if you prefer.

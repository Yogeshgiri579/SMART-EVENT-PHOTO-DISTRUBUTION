import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { config } from '../config/index.js'

// For Backblaze B2 (and any real S3-compatible cloud), there is only ONE endpoint.
// The "internal" vs "external" split only existed for local Docker (minio:9000 vs localhost:9000).
// On Render, both use MINIO_ENDPOINT directly.

let s3Client = null

function getClient() {
  if (s3Client) return s3Client
  s3Client = new S3Client({
    region: 'us-east-1',
    credentials: config.s3.accessKey
      ? { accessKeyId: config.s3.accessKey, secretAccessKey: config.s3.secretKey }
      : undefined,
    endpoint: config.s3.endpoint,
    forcePathStyle: true,
  })
  return s3Client
}

const Bucket = config.s3.bucket

export function getUploadUrl(Key, ContentType = 'image/jpeg') {
  const cmd = new PutObjectCommand({ Bucket, Key, ContentType })
  return getSignedUrl(getClient(), cmd, { expiresIn: 3600 })
}

export async function getSignedGetUrl(Key, expiresIn = 3600) {
  const cmd = new GetObjectCommand({ Bucket, Key })
  return await getSignedUrl(getClient(), cmd, { expiresIn })
}

// Alias — kept for API compatibility. On Render both internal and external
// use the same endpoint (Backblaze B2 doesn't distinguish).
export async function getExternalSignedGetUrl(Key, expiresIn = 3600) {
  return getSignedGetUrl(Key, expiresIn)
}

export async function uploadBuffer(Key, Body, ContentType = 'image/jpeg') {
  const cmd = new PutObjectCommand({ Bucket, Key, Body, ContentType })
  await getClient().send(cmd)
  return Key
}

export async function getObjectBuffer(Key) {
  const cmd = new GetObjectCommand({ Bucket, Key })
  const response = await getClient().send(cmd)
  const chunks = []
  for await (const chunk of response.Body) chunks.push(chunk)
  return Buffer.concat(chunks)
}

export { Bucket }

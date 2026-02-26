import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { config } from '../config/index.js'

let s3Client = null
let externalS3Client = null

function getClient() {
  if (s3Client) return s3Client
  const opts = {
    region: 'us-east-1', // MinIO still requires a region parameter, us-east-1 is standard
    credentials: config.s3.accessKey
      ? { accessKeyId: config.s3.accessKey, secretAccessKey: config.s3.secretKey }
      : undefined,
  }
  if (config.s3.endpoint) {
    opts.endpoint = config.s3.endpoint
    opts.forcePathStyle = true
  }
  s3Client = new S3Client(opts)
  return s3Client
}

function getExternalClient() {
  if (externalS3Client) return externalS3Client
  const opts = {
    region: 'us-east-1',
    credentials: config.s3.accessKey
      ? { accessKeyId: config.s3.accessKey, secretAccessKey: config.s3.secretKey }
      : undefined,
  }
  const externalEndpoint = process.env.MINIO_EXTERNAL_ENDPOINT || 'http://localhost:9000'
  opts.endpoint = externalEndpoint
  opts.forcePathStyle = true
  externalS3Client = new S3Client(opts)
  return externalS3Client
}

const Bucket = config.s3.bucket

export function getUploadUrl(Key, ContentType = 'image/jpeg') {
  const client = getExternalClient()
  const cmd = new PutObjectCommand({ Bucket, Key, ContentType })
  return getSignedUrl(client, cmd, { expiresIn: 3600 })
}

export async function getSignedGetUrl(Key, expiresIn = 3600) {
  const client = getClient()
  const cmd = new GetObjectCommand({ Bucket, Key })
  return await getSignedUrl(client, cmd, { expiresIn })
}

export async function getExternalSignedGetUrl(Key, expiresIn = 3600) {
  const client = getExternalClient()
  const cmd = new GetObjectCommand({ Bucket, Key })
  return await getSignedUrl(client, cmd, { expiresIn })
}

export async function uploadBuffer(Key, Body, ContentType = 'image/jpeg') {
  const client = getClient()
  const cmd = new PutObjectCommand({ Bucket, Key, Body, ContentType })
  await client.send(cmd)
  return Key
}

export async function getObjectBuffer(Key) {
  const client = getClient()
  const cmd = new GetObjectCommand({ Bucket, Key })
  const response = await client.send(cmd)
  const chunks = []
  for await (const chunk of response.Body) chunks.push(chunk)
  return Buffer.concat(chunks)
}

export { Bucket }

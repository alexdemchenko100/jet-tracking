import { Storage } from '@google-cloud/storage'
import pino from 'pino'

const logger = pino()

const BUCKET_PREFIX = process.env.NODE_ENV == 'production' ? 'pa-acct' : 'pa-acct-dev'

const storage = new Storage(
  process.env.NODE_ENV == 'production'
    ? undefined
    : {
        projectId: process.env.FIREBASE_PROJECT_ID,
        scopes: 'https://www.googleapis.com/auth/cloud-platform',
        credentials: {
          client_email: process.env.FIREBASE_CLIENT_EMAIL,
          private_key: process.env.FIREBASE_PRIVATE_KEY,
        },
      }
)

export async function createBucket(name: string) {
  const bucketName = `${BUCKET_PREFIX}-${name}`
  await storage.createBucket(bucketName)
  logger.info(`Bucket ${bucketName} created.`)
}

export async function uploadObject(
  accountId: string,
  monitorResultId: string,
  objectName: string,
  data: string
) {
  const bucketName = `${BUCKET_PREFIX}-${accountId}`
  const filePath = `${monitorResultId}/${objectName}`
  await storage.bucket(bucketName).file(filePath).save(data)

  logger.info(`${filePath} uploaded to the bucket: ${bucketName}`)
}

export async function readObject(accountId: string, monitorResultId: string, objectName: string) {
  const bucketName = `${BUCKET_PREFIX}-${accountId}`
  const filePath = `${monitorResultId}/${objectName}`
  const file = await storage.bucket(bucketName).file(filePath).download()
  return file[0].toString('utf8')
}

export async function deleteObject(accountId: string, monitorResultId: string, objectName: string) {
  const bucketName = `${BUCKET_PREFIX}-${accountId}`
  const filePath = `${monitorResultId}/${objectName}`
  const file = await storage.bucket(bucketName).file(filePath)
  if (file) {
    file.delete()
    logger.info(`${filePath} removed from the bucket: ${bucketName}`)
  }
}

export async function deleteBucket(name: string) {
  const bucketName = `${BUCKET_PREFIX}-${name}`
  await storage.bucket(bucketName).delete()
  logger.info(`Bucket ${bucketName} removed.`)
}

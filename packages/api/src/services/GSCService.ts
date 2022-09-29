import { Storage } from '@google-cloud/storage'
import { logger } from '../Context'

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
  try {
    const bucketName = `${BUCKET_PREFIX}-${name}`
    const bucket = storage.bucket(bucketName)
    const bucketExists = await bucket.exists()
    if (!bucketExists) await storage.createBucket(bucketName)
    logger.info(`Bucket ${bucketName} created.`)
  } catch (e) {}
}

export async function uploadObject(
  accountId: string,
  folderName: string,
  objectName: string,
  data: string
) {
  const bucketName = `${BUCKET_PREFIX}-${accountId}`
  const filePath = `${folderName}/${objectName}`
  try {
    await storage.bucket(bucketName).file(filePath).save(data)
    logger.info(`${filePath} uploaded to the bucket: ${bucketName}`)
  } catch (e) {
    logger.error(e, 'upload failed, seeing if bucket exists')
    const msg = e?.message as string
    if (msg && msg.includes('bucket does not exist')) {
      try {
        await storage.createBucket(bucketName)
        logger.info(`Bucket ${bucketName} created.`)
        //now, try saving again
        await storage.bucket(bucketName).file(filePath).save(data)
        logger.info(`${filePath} uploaded to the bucket: ${bucketName}`)
      } catch (e) {
        //give up... tried our best
      }
    }
  }
}

export async function readObject(accountId: string, folderName: string, objectName: string) {
  const bucketName = `${BUCKET_PREFIX}-${accountId}`
  const filePath = `${folderName}/${objectName}`
  const bucket = storage.bucket(bucketName)
  try {
    const file = await bucket.file(filePath).download()
    return file[0].toString('utf8')
  } catch (e) {
    logger.error({ filePath }, 'Storage object read failed')
  }
  return ''
}

export async function deleteObject(accountId: string, folderName: string, objectName: string) {
  const bucketName = `${BUCKET_PREFIX}-${accountId}`
  const filePath = `${folderName}/${objectName}`
  const file = storage.bucket(bucketName).file(`${folderName}/${objectName}`)
  try {
    logger.info(`Deleting ${filePath} from the bucket: ${bucketName}`)
    await file.delete()
  } catch (e) {
    logger.error(e, 'object delete failed')
  }
}

export async function deleteBucket(name: string) {
  const bucketName = `${BUCKET_PREFIX}-${name}`
  await storage.bucket(bucketName).delete()
  logger.info(`Bucket ${bucketName} removed.`)
}

import { Storage } from '@google-cloud/storage'

const storage = new Storage({
  projectId: process.env.FIREBASE_PROJECT_ID,
  scopes: 'https://www.googleapis.com/auth/cloud-platform',
  credentials: {
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    private_key: process.env.FIREBASE_PRIVATE_KEY,
  },
})

export async function createBucket(name: string) {
  const bucketName = `${process.env.GOOGLE_CLOUD_BUCKET_PREFIX}-${name}`
  await storage.createBucket(bucketName)
  console.log(`Bucket ${bucketName} created.`)
}

export async function uploadObject(
  accountId: string,
  monitorResultId: string,
  objectName: string,
  data: string
) {
  const bucketName = `${process.env.GOOGLE_CLOUD_BUCKET_PREFIX}-${accountId}`
  const filePath = `${monitorResultId}/${objectName}`
  await storage.bucket(bucketName).file(filePath).save(data)

  console.log(`${filePath} uploaded to the bucket: ${bucketName}`)
}

export async function readObject(accountId: string, monitorResultId: string, objectName: string) {
  const bucketName = `${process.env.GOOGLE_CLOUD_BUCKET_PREFIX}-${accountId}`
  const filePath = `${monitorResultId}/${objectName}`
  const file = await storage.bucket(bucketName).file(filePath).download()
  return file[0].toString('utf8')
}

export async function deleteObject(accountId: string, monitorResultId: string, objectName: string) {
  const bucketName = `${process.env.GOOGLE_CLOUD_BUCKET_PREFIX}-${accountId}`
  const filePath = `${monitorResultId}/${objectName}`
  await storage.bucket(bucketName).file(filePath).delete()
  console.log(`${filePath} removed from the bucket: ${bucketName}`)
}

export async function deleteBucket(name: string) {
  const bucketName = `${process.env.GOOGLE_CLOUD_BUCKET_PREFIX}-${name}`
  await storage.bucket(bucketName).delete()
  console.log(`Bucket ${bucketName} removed.`)
}

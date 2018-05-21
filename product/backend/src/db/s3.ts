import * as aws from 'aws-sdk'
import { BUCKET_NAME } from '../config'
import genUuid from '../utils/genUuid'

const s3 = new aws.S3({ params: { Bucket: BUCKET_NAME } })

// TODO(dli): Figure out actual bucket names
export function uploadStream(stream) {
  const key = genUuid()
  const params = { Key: key, Body: stream, Bucket: 'bucket' }
  const promise = new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })

  return { key, promise }
}

export async function deleteObject(key) {
  const params = { Key: key, Bucket: 'bucket' }
  const promise = new Promise((resolve, reject) => {
    s3.deleteObject(params, (err, data) => {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })

  return { key, promise }
}

export default exports

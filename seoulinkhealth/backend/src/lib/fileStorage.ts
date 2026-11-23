import fs from 'fs'
import path from 'path'
import type { Readable } from 'stream'
import { Storage } from '@google-cloud/storage'

/**
 * Where uploaded attachments are kept.
 *
 * - GCS_BUCKET set   → Google Cloud Storage (production). Cloud Run's own disk
 *   is wiped on every redeploy/restart, so production must use this.
 *   Credentials come from the Cloud Run service account automatically.
 * - GCS_BUCKET unset → local disk under FILES_DIR (development only).
 *
 * Objects are stored as `<companyId>/<storedName>`.
 */

export interface FileStorage {
  readonly kind: 'gcs' | 'disk'
  save(companyId: string, storedName: string, data: Buffer, mimeType: string): Promise<void>
  /** Returns a readable stream, or null when the object does not exist. */
  open(companyId: string, storedName: string): Promise<Readable | null>
  /** Deletes the object; a missing object is not an error. */
  remove(companyId: string, storedName: string): Promise<void>
}

const objectKey = (companyId: string, storedName: string) => `${companyId}/${storedName}`

function gcsStorage(bucketName: string): FileStorage {
  const bucket = new Storage().bucket(bucketName)
  return {
    kind: 'gcs',
    async save(companyId, storedName, data, mimeType) {
      await bucket.file(objectKey(companyId, storedName)).save(data, {
        contentType: mimeType,
        resumable: false,
      })
    },
    async open(companyId, storedName) {
      const file = bucket.file(objectKey(companyId, storedName))
      const [exists] = await file.exists()
      return exists ? file.createReadStream() : null
    },
    async remove(companyId, storedName) {
      await bucket.file(objectKey(companyId, storedName)).delete({ ignoreNotFound: true })
    },
  }
}

function diskStorage(baseDir: string): FileStorage {
  const fullPath = (companyId: string, storedName: string) =>
    path.join(baseDir, companyId, storedName)
  return {
    kind: 'disk',
    async save(companyId, storedName, data) {
      await fs.promises.mkdir(path.join(baseDir, companyId), { recursive: true })
      await fs.promises.writeFile(fullPath(companyId, storedName), data)
    },
    async open(companyId, storedName) {
      const p = fullPath(companyId, storedName)
      return fs.existsSync(p) ? fs.createReadStream(p) : null
    },
    async remove(companyId, storedName) {
      await fs.promises.rm(fullPath(companyId, storedName), { force: true })
    },
  }
}

export const fileStorage: FileStorage = process.env.GCS_BUCKET
  ? gcsStorage(process.env.GCS_BUCKET)
  : diskStorage(process.env.FILES_DIR ?? '/app/data/files')

if (fileStorage.kind === 'disk' && process.env.NODE_ENV === 'production') {
  console.warn(
    '[files] GCS_BUCKET is not set — attachments are stored on local disk and will be lost on redeploy.'
  )
}

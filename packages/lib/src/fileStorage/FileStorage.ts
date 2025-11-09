import { Readable } from 'stream'
import path from 'path'
import crypto from 'crypto'

import fs from 'fs-extra'
import mime from 'mime-types'

import {
  S3,
  GetObjectCommand,
  GetObjectCommandOutput,
  HeadObjectCommandOutput,
  DeleteObjectCommandOutput,
  HeadBucketCommandOutput,
  ListObjectsCommandOutput,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import config from '../configManager/config'
import tempFolderPath from '../utils/tempFolderPath'
import { writeFileToTemp } from '../utils/filesystem'
import Image from './Image'
import { FileStorageConfig } from '../configManager/configSchema'

import {
  StoredObject,
  FileStorageUploadOptions,
  FileStorageGetUrlOptions,
} from './types'

const streamToString = (stream): Promise<string> => {
  const chunks = []
  return new Promise((resolve, reject) => {
    stream.on('data', chunk => chunks.push(Buffer.from(chunk)))
    stream.on('error', err => reject(err))
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
  })
}

class FileStorage {
  bucket: string
  imageConversionToSupportedFormatMapper = { eps: 'svg' }
  s3: S3
  separateDeleteOperations: boolean
  url: string

  constructor(
    connectionConfig?: FileStorageConfig,
    properties?: Partial<FileStorageConfig>,
  ) {
    const DEFAULT_REGION = 'us-east-1'

    const configToUse = connectionConfig || config.get('fileStorage')

    const {
      accessKeyId,
      secretAccessKey,
      bucket,
      region,
      url,
      s3ForcePathStyle,
      s3SeparateDeleteOperations,
    } = configToUse

    this.url = url
    this.bucket = bucket

    const forcePathStyle = s3ForcePathStyle ?? true

    const s3config = {
      credentials: null,
      forcePathStyle,
      endpoint: url,
      region: region || DEFAULT_REGION,
    }

    /**
     * These are optional as authentication in AWS could happen through the
     * existence of environment variables or IAM roles.
     *
     * If the environment is not set up correctly, startup will fail when
     * checking the file storage connection.
     */
    if (accessKeyId || secretAccessKey) {
      s3config.credentials = {
        accessKeyId,
        secretAccessKey,
      }
    }

    this.s3 = new S3(s3config)

    this.separateDeleteOperations = s3SeparateDeleteOperations

    /**
     * Override some values only for testing purposes.
     * This is fine, as we're not exporting the contructor from the lib.
     */
    if (properties) {
      Object.keys(properties).forEach(key => {
        this[key] = properties[key]
      })
    }
  }

  async #get(key: string): Promise<GetObjectCommandOutput> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    })

    try {
      return this.s3.send(command)
    } catch (e) {
      throw new Error(
        `Cannot retrieve item ${key} from bucket ${this.bucket}: ${e.message}`,
      )
    }
  }

  async #getFileInfo(key: string): Promise<HeadObjectCommandOutput> {
    const params = {
      Bucket: this.bucket,
      Key: key,
    }

    return this.s3.headObject(params)
  }

  async #handleImageUpload(
    fileStream,
    hashedFilename,
    isPublic,
  ): Promise<StoredObject[]> {
    const randomHash = crypto.randomBytes(6).toString('hex')
    const tempDir = path.join(tempFolderPath, randomHash)
    await fs.ensureDir(tempDir)
    const originalFilePath = path.join(randomHash, hashedFilename)
    await writeFileToTemp(fileStream, originalFilePath)

    const image = new Image({
      filename: hashedFilename,
      dir: tempDir,
    })

    const dataToUpload = await image.generateVersions()

    const storedObjects = await Promise.all(
      dataToUpload.map(async item => {
        const uploadedKey = await this.#uploadFileHandler(
          fs.createReadStream(item.path),
          item.filename,
          item.mimetype,
          isPublic,
        )

        const uploaded = {
          key: uploadedKey,
          imageMetadata: {
            density: item.imageMetadata.density,
            height: item.imageMetadata.height,
            space: item.imageMetadata.space,
            width: item.imageMetadata.width,
          },
          size: item.size,
          extension: item.extension,
          type: item.type,
          mimetype: item.mimetype,
        }

        return uploaded
      }),
    )

    await fs.remove(tempDir)
    return storedObjects
  }

  async #uploadFileHandler(
    fileStream,
    filename,
    mimetype,
    isPublic?: boolean,
  ): Promise<string> {
    const params: PutObjectCommandInput = {
      Bucket: this.bucket,
      Key: filename, // file name you want to save as
      Body: fileStream,
      ContentType: mimetype,
    }

    if (isPublic) params.ACL = 'public-read'

    const upload = new Upload({
      client: this.s3,
      params,
    })

    // upload.on('httpUploadProgress', progress => {
    //   console.log(progress)
    // })

    const data = await upload.done()
    return data.Key
  }

  // object keys is an array
  async delete(
    objectKeys,
  ): Promise<DeleteObjectCommandOutput | DeleteObjectCommandOutput[]> {
    if (!objectKeys || (Array.isArray(objectKeys) && objectKeys.length === 0)) {
      throw new Error('No keys provided. Nothing to delete.')
    }

    // delete a single key
    if (!Array.isArray(objectKeys)) {
      const params = { Bucket: this.bucket, Key: objectKeys }
      return this.s3.deleteObject(params)
    }

    // gcp compatibility - does not support batch delete
    if (this.separateDeleteOperations) {
      return Promise.all(
        objectKeys.map(async objectKey => {
          const params = { Bucket: this.bucket, Key: objectKey }
          return this.s3.deleteObject(params)
        }),
      )
    }

    const params = {
      Bucket: this.bucket,
      Delete: {
        Objects: objectKeys.map(k => ({ Key: k })),
        Quiet: false,
      },
    }

    return this.s3.deleteObjects(params)
  }

  async download(key, localPath): Promise<void> {
    const item = await this.#get(key)
    const body = item.Body

    if (!body) {
      throw new Error(`Item ${key} has no body.`)
    }

    if (!(body instanceof Readable)) {
      throw new Error(`Item ${key} body is not a Node.js Readable stream.`)
    }

    try {
      const writeStream = fs.createWriteStream(localPath)

      await new Promise((resolve, reject) => {
        body
          .on('error', reject) // catch stream download errors
          .pipe(writeStream)
          .on('error', reject) // catch disk write errors
          .on('finish', () => resolve(undefined))
      })
    } catch (e) {
      throw new Error(`Error writing item ${key} to disk. ${e.message}`)
    }
  }

  async getFileContent(objectKey): Promise<string> {
    const data = await this.#get(objectKey)
    return streamToString(data.Body)
  }

  async getURL(
    objectKey: string,
    options: FileStorageGetUrlOptions = {},
  ): Promise<string> {
    const { expiresIn } = options

    const s3Params = {
      expiresIn: expiresIn || 24 * 3600, // 1 day
    }

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: objectKey,
    })

    return getSignedUrl(this.s3, command, s3Params)
  }

  getPublicURL(objectKey): string {
    return `${this.url}/${this.bucket}/${objectKey}`
  }

  async healthCheck(): Promise<HeadBucketCommandOutput> {
    return this.s3.headBucket({ Bucket: this.bucket })
  }

  async list(): Promise<ListObjectsCommandOutput> {
    return this.s3.listObjects({ Bucket: this.bucket })
  }

  async upload(
    fileStream,
    filename,
    options: FileStorageUploadOptions = {},
  ): Promise<StoredObject[]> {
    if (!filename) throw new Error('filename is required')

    const mimetype = mime.lookup(filename) || 'application/octet-stream'
    const { forceObjectKeyValue } = options
    const hash = crypto.randomBytes(6).toString('hex')
    const extension = path.extname(filename).slice(1)
    const hashedFilename = forceObjectKeyValue || `${hash}.${extension}`
    const isPublic = options.public || false

    const shouldConvert =
      !!this.imageConversionToSupportedFormatMapper[extension]

    const isImage = mimetype.match(/^image\//) || shouldConvert

    if (isImage)
      return this.#handleImageUpload(fileStream, hashedFilename, isPublic)

    const storedObjectKey = await this.#uploadFileHandler(
      fileStream,
      hashedFilename,
      mimetype,
      isPublic,
    )
    const { ContentLength } = await this.#getFileInfo(storedObjectKey)

    const storedObject = {
      key: storedObjectKey,
      type: 'original',
      size: ContentLength,
      extension: extension,
      mimetype: mimetype,
    }

    return [storedObject]
  }
}

export default FileStorage

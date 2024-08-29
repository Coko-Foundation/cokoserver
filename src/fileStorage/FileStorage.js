const fs = require('fs-extra')
const config = require('config')
const crypto = require('crypto')
const path = require('path')
const mime = require('mime-types')

const { S3, GetObjectCommand } = require('@aws-sdk/client-s3')
const { Upload } = require('@aws-sdk/lib-storage')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')

const tempFolderPath = require('../utils/tempFolderPath')
const { writeFileToTemp } = require('../utils/filesystem')
const envUtils = require('../utils/env')
const Image = require('./Image')

class FileStorage {
  constructor(connectionConfig, properties) {
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

    const forcePathStyle = envUtils.isTrue(s3ForcePathStyle) || true

    this.s3 = new S3({
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle,
      endpoint: url,
      region: region || DEFAULT_REGION,
    })

    this.bucket = bucket

    this.separateDeleteOperations = envUtils.isTrue(s3SeparateDeleteOperations)

    this.imageConversionToSupportedFormatMapper = {
      eps: 'svg',
    }

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

  async #getFileInfo(key) {
    const params = {
      Bucket: this.bucket,
      Key: key,
    }

    return this.s3.headObject(params)
  }

  async #handleImageUpload(fileStream, hashedFilename) {
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
        const uploaded = await this.#uploadFileHandler(
          fs.createReadStream(item.path),
          item.filename,
          item.mimetype,
        )

        uploaded.imageMetadata = {
          density: item.imageMetadata.density,
          height: item.imageMetadata.height,
          space: item.imageMetadata.space,
          width: item.imageMetadata.width,
        }
        uploaded.size = item.size
        uploaded.extension = item.extension
        uploaded.type = item.type
        uploaded.mimetype = item.mimetype

        return uploaded
      }),
    )

    await fs.remove(tempDir)
    return storedObjects
  }

  async #uploadFileHandler(fileStream, filename, mimetype) {
    const params = {
      Bucket: this.bucket,
      Key: filename, // file name you want to save as
      Body: fileStream,
      ContentType: mimetype,
    }

    const upload = new Upload({
      client: this.s3,
      params,
    })

    // upload.on('httpUploadProgress', progress => {
    //   console.log(progress)
    // })

    const data = await upload.done()

    const { Key } = data
    return { key: Key }
  }

  // object keys is an array
  async delete(objectKeys) {
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

  async download(key, localPath) {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    })

    let item

    try {
      item = await this.s3.send(command)
    } catch (e) {
      throw new Error(
        `Cannot retrieve item ${key} from bucket ${this.bucket}: ${e.message}`,
      )
    }

    try {
      const writeStream = fs.createWriteStream(localPath)
      item.Body.pipe(writeStream)

      await new Promise(resolve => {
        writeStream.on('finish', resolve)
      })

      writeStream.end()
    } catch (e) {
      throw new Error(`Error writing item ${key} to disk. ${e.message}`)
    }
  }

  async getURL(objectKey, options = {}) {
    const { expiresIn } = options

    const s3Params = {
      Bucket: this.bucket,
      Key: objectKey,
      Expires: expiresIn || parseInt(86400, 10), // 1 day lease
    }

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: objectKey,
    })

    return getSignedUrl(this.s3, command, s3Params)
  }

  async healthCheck() {
    return this.s3.headBucket({ Bucket: this.bucket })
  }

  async list() {
    return this.s3.listObjects({ Bucket: this.bucket })
  }

  async upload(fileStream, filename, options = {}) {
    if (!filename) throw new Error('filename is required')

    const mimetype = mime.lookup(filename) || 'application/octet-stream'
    const { forceObjectKeyValue } = options
    const hash = crypto.randomBytes(6).toString('hex')
    const extension = path.extname(filename).slice(1)
    const hashedFilename = forceObjectKeyValue || `${hash}.${extension}`

    const shouldConvert =
      !!this.imageConversionToSupportedFormatMapper[extension]

    const isImage = mimetype.match(/^image\//) || shouldConvert

    if (isImage) return this.#handleImageUpload(fileStream, hashedFilename)

    const storedObject = await this.#uploadFileHandler(
      fileStream,
      hashedFilename,
      mimetype,
    )

    const { ContentLength } = await this.#getFileInfo(storedObject.key)
    storedObject.type = 'original'
    storedObject.size = ContentLength
    storedObject.extension = extension
    storedObject.mimetype = mimetype
    return [storedObject]
  }
}

module.exports = FileStorage

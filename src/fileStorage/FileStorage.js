const fs = require('fs-extra')
const config = require('config')
const crypto = require('crypto')
const path = require('path')
const mime = require('mime-types')

const { S3, GetObjectCommand } = require('@aws-sdk/client-s3')
const { Upload } = require('@aws-sdk/lib-storage')
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')

const logger = require('../logger')
const tempFolderPath = require('../utils/tempFolderPath')

const {
  getFileExtension,
  writeFileFromStream,
  handleUnsupportedImageFormats,
  handleImageVersionsCreation,
  convertFileStreamIntoBuffer,
  getImageFileMetadata,
  emptyUndefinedOrNull,
} = require('../helpers')

class FileStorage {
  constructor(properties) {
    const DEFAULT_REGION = 'us-east-1'

    const {
      accessKeyId,
      secretAccessKey,
      bucket,
      region,
      protocol,
      host,
      port,
      s3ForcePathStyle,
      s3SeparateDeleteOperations,
    } = config.get('fileStorage')

    const fileStorageUrl = `${protocol}://${host}${port ? `:${port}` : ''}`

    const forcePathStyle = !emptyUndefinedOrNull(s3ForcePathStyle)
      ? JSON.parse(s3ForcePathStyle)
      : true

    this.s3 = new S3({
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle,
      endpoint: fileStorageUrl,
      region: region || DEFAULT_REGION,
    })

    this.bucket = bucket
    this.s3SeparateDeleteOperations = s3SeparateDeleteOperations

    this.imageConversionToSupportedFormatMapper = {
      eps: 'svg',
    }

    this.separateDeleteOperations = !emptyUndefinedOrNull(
      this.s3SeparateDeleteOperations,
    )
      ? JSON.parse(this.s3SeparateDeleteOperations)
      : false

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

    return this.s3.getObject(params)
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

  // TO DO -- also private? maybe only expose upload
  async handleImageUpload(fileStream, hashedFilename) {
    try {
      const storedObjects = []
      const randomHash = crypto.randomBytes(6).toString('hex')
      const tempDirRoot = tempFolderPath
      const tempDir = path.join(tempDirRoot, randomHash)
      let tempSmallFilePath
      let tempMediumFilePath
      let tempFullFilePath

      await fs.ensureDir(tempDir)
      const originalFilePath = path.join(tempDir, hashedFilename)

      await writeFileFromStream(fileStream, originalFilePath)

      /* eslint-disable no-prototype-builtins */
      if (
        this.imageConversionToSupportedFormatMapper.hasOwnProperty(
          getFileExtension(hashedFilename),
        )
      ) {
        await handleUnsupportedImageFormats(hashedFilename, tempDir)

        const {
          tempSmallFile,
          tempMediumFile,
          tempFullFile,
          tempOriginalFilePath,
        } = await handleImageVersionsCreation(hashedFilename, tempDir, true)

        tempSmallFilePath = tempSmallFile
        tempMediumFilePath = tempMediumFile
        tempFullFilePath = tempFullFile

        const originalImageStream = fs.createReadStream(tempOriginalFilePath)

        const originalFileBuffer = await convertFileStreamIntoBuffer(
          originalImageStream,
        )

        const { width, height, space, density, size } =
          await getImageFileMetadata(originalFileBuffer)

        const original = await this.uploadFileHandler(
          fs.createReadStream(originalFilePath),
          hashedFilename,
          mime.lookup(hashedFilename),
        )

        original.imageMetadata = {
          density,
          height,
          space,
          width,
        }
        original.size = size
        original.extension = `${getFileExtension(hashedFilename)}`
        original.type = 'original'
        original.mimetype = mime.lookup(hashedFilename)
        storedObjects.push(original)
      } else {
        const { tempSmallFile, tempMediumFile, tempFullFile } =
          await handleImageVersionsCreation(hashedFilename, tempDir)

        tempSmallFilePath = tempSmallFile
        tempMediumFilePath = tempMediumFile
        tempFullFilePath = tempFullFile
        const originalImageStream = fs.createReadStream(originalFilePath)

        const originalFileBuffer = await convertFileStreamIntoBuffer(
          originalImageStream,
        )

        const { width, height, space, density, size } =
          await getImageFileMetadata(originalFileBuffer)

        const original = await this.uploadFileHandler(
          fs.createReadStream(originalFilePath),
          hashedFilename,
          mime.lookup(hashedFilename),
        )

        original.imageMetadata = {
          density,
          height,
          space,
          width,
        }
        original.size = size
        original.extension = `${getFileExtension(hashedFilename)}`
        original.type = 'original'
        original.mimetype = mime.lookup(hashedFilename)
        storedObjects.push(original)
      }
      /* eslint-enable no-prototype-builtins */

      const fullImageStream = fs.createReadStream(tempFullFilePath)

      const full = await this.uploadFileHandler(
        fs.createReadStream(tempFullFilePath),
        path.basename(tempFullFilePath),
        mime.lookup(tempFullFilePath),
      )

      const fullFileBuffer = await convertFileStreamIntoBuffer(fullImageStream)

      const {
        width: fWidth,
        height: fHeight,
        space: fSpace,
        density: fDensity,
        size: fSize,
      } = await getImageFileMetadata(fullFileBuffer)

      full.imageMetadata = {
        density: fDensity,
        height: fHeight,
        space: fSpace,
        width: fWidth,
      }
      full.size = fSize
      full.extension = `${getFileExtension(tempFullFilePath)}`
      full.type = 'full'
      full.mimetype = mime.lookup(tempFullFilePath)

      storedObjects.push(full)

      const mediumImageStream = fs.createReadStream(tempMediumFilePath)

      const medium = await this.uploadFileHandler(
        fs.createReadStream(tempMediumFilePath),
        path.basename(tempMediumFilePath),
        mime.lookup(tempMediumFilePath),
      )

      const mediumFileBuffer = await convertFileStreamIntoBuffer(
        mediumImageStream,
      )

      const {
        width: mWidth,
        height: mHeight,
        space: mSpace,
        density: mDensity,
        size: mSize,
      } = await getImageFileMetadata(mediumFileBuffer)

      medium.imageMetadata = {
        density: mDensity,
        height: mHeight,
        space: mSpace,
        width: mWidth,
      }
      medium.size = mSize
      medium.extension = `${getFileExtension(tempMediumFilePath)}`
      medium.type = 'medium'
      medium.mimetype = mime.lookup(tempMediumFilePath)

      storedObjects.push(medium)
      const smallImageStream = fs.createReadStream(tempSmallFilePath)

      const small = await this.uploadFileHandler(
        fs.createReadStream(tempSmallFilePath),
        path.basename(tempSmallFilePath),
        mime.lookup(tempSmallFilePath),
      )

      const smallFileBuffer = await convertFileStreamIntoBuffer(
        smallImageStream,
      )

      const {
        width: sWidth,
        height: sHeight,
        space: sSpace,
        density: sDensity,
        size: sSize,
      } = await getImageFileMetadata(smallFileBuffer)

      small.imageMetadata = {
        density: sDensity,
        height: sHeight,
        space: sSpace,
        width: sWidth,
      }
      small.size = sSize
      small.extension = `${getFileExtension(tempSmallFilePath)}`
      small.type = 'small'
      small.mimetype = mime.lookup(tempSmallFilePath)

      storedObjects.push(small)

      await fs.remove(tempDir)

      return storedObjects
    } catch (e) {
      throw new Error(e)
    }
  }

  async healthCheck() {
    try {
      return new Promise((resolve, reject) => {
        this.s3.headBucket({ Bucket: this.bucket }, (err, data) => {
          if (err) {
            logger.error(
              'File Storage Healthcheck: Communication to remote file service unsuccessful',
            )
            return reject(err)
          }

          // logger.info('File Storage Healthcheck: OK')
          return resolve(data)
        })
      })
    } catch (e) {
      throw new Error(e)
    }
  }

  async list() {
    const params = {
      Bucket: this.bucket,
    }

    return new Promise((resolve, reject) => {
      this.s3.listObjects(params, (err, data) => {
        if (err) {
          reject(err)
        }

        resolve(data)
      })
    })
  }

  async upload(fileStream, filename, options = {}) {
    try {
      if (!filename) {
        throw new Error('filename is required')
      }

      const { forceObjectKeyValue } = options

      const mimetype = mime.lookup(filename) || 'application/octet-stream'
      let storedObjects = []

      const hashedFilename =
        forceObjectKeyValue ||
        `${crypto.randomBytes(6).toString('hex')}${getFileExtension(
          filename,
          true,
        )}`

      /* eslint-disable no-prototype-builtins */
      if (
        !mimetype.match(/^image\//) &&
        !this.imageConversionToSupportedFormatMapper.hasOwnProperty(
          getFileExtension(filename),
        )
      ) {
        const storedObject = await this.uploadFileHandler(
          fileStream,
          hashedFilename,
          mimetype,
        )

        const { ContentLength } = await this.#getFileInfo(storedObject.key)
        storedObject.type = 'original'
        storedObject.size = ContentLength
        storedObject.extension = `${getFileExtension(filename)}`
        storedObject.mimetype = mimetype
        storedObjects.push(storedObject)
        return storedObjects
      }
      /* eslint-enable no-prototype-builtins */

      storedObjects = await this.handleImageUpload(
        fileStream,
        hashedFilename,
        mimetype,
      )

      return storedObjects
    } catch (e) {
      throw new Error(e)
    }
  }

  // TO DO -- make private? migration is using it
  async uploadFileHandler(fileStream, filename, mimetype) {
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

    // do we need etag?
    const { Key } = data
    return { key: Key }
  }
}

module.exports = FileStorage

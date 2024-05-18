const AWS = require('aws-sdk')
const fs = require('fs-extra')
const config = require('config')
const forEach = require('lodash/forEach')
const crypto = require('crypto')
const path = require('path')
const mime = require('mime-types')

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

const imageConversionToSupportedFormatMapper = {
  eps: 'svg',
}

// Initializing Storage Interface
let s3

const healthCheck = async () => {
  try {
    if (!s3) {
      throw new Error(
        's3 does not exist! Probably configuration is missing/invalid',
      )
    }

    const { bucket } = config.get('fileStorage')

    return new Promise((resolve, reject) => {
      s3.headBucket({ Bucket: bucket }, (err, data) => {
        if (err) {
          logger.error(
            'File Storage Healthcheck: Communication to remote file service unsuccessful',
          )
          return reject(err)
        }

        logger.info('File Storage Healthcheck: OK')
        return resolve(data)
      })
    })
  } catch (e) {
    throw new Error(e)
  }
}

const connectToFileStorage = async () => {
  if (!config.has('fileStorage')) {
    throw new Error(
      'You have declared that you will use file storage but fileStorage configuration is missing',
    )
  }

  const {
    accessKeyId,
    secretAccessKey,
    bucket,
    protocol,
    host,
    port,
    s3ForcePathStyle,
  } = config.get('fileStorage')

  if (!protocol) {
    throw new Error(
      'Missing required protocol param for initializing file storage',
    )
  }

  if (!host) {
    throw new Error('Missing required host param for initializing file storage')
  }

  // if (!accessKeyId) {
  //   throw new Error(
  //     'Missing required accessKeyId param for initializing file storage',
  //   )
  // }

  // if (!secretAccessKey) {
  //   throw new Error(
  //     'Missing required secretAccessKey param for initializing file storage',
  //   )
  // }

  if (!bucket) {
    throw new Error(
      'Missing required bucket param for initializing file storage',
    )
  }

  const serverUrl = `${protocol}://${host}${port ? `:${port}` : ''}`

  s3 = new AWS.S3({
    accessKeyId,
    signatureVersion: 'v4',
    secretAccessKey,
    s3ForcePathStyle: !emptyUndefinedOrNull(s3ForcePathStyle)
      ? JSON.parse(s3ForcePathStyle)
      : true,
    endpoint: serverUrl,
  })

  await healthCheck()
}

const getURL = async (objectKey, options = {}) => {
  if (!s3) {
    throw new Error(
      's3 does not exist! Probably configuration is missing/invalid',
    )
  }

  const { bucket } = config.get('fileStorage')
  const { expiresIn } = options

  const s3Params = {
    Bucket: bucket,
    Key: objectKey,
    Expires: expiresIn || parseInt(86400, 10), // 1 day lease
  }

  return s3.getSignedUrl('getObject', s3Params)
}

const uploadFileHandler = (fileStream, filename, mimetype) => {
  if (!s3) {
    throw new Error(
      's3 does not exist! Probably configuration is missing/invalid',
    )
  }

  const { bucket } = config.get('fileStorage')

  const params = {
    Bucket: bucket,
    Key: filename, // file name you want to save as
    Body: fileStream,
    ContentType: mimetype,
  }

  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
      if (err) {
        reject(err)
      }

      // do we need etag?
      const { Key } = data
      resolve({ key: Key })
    })
  })
}

const handleImageUpload = async (fileStream, hashedFilename) => {
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
      imageConversionToSupportedFormatMapper.hasOwnProperty(
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

      const original = await uploadFileHandler(
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

      const original = await uploadFileHandler(
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

    const full = await uploadFileHandler(
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

    const medium = await uploadFileHandler(
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

    const small = await uploadFileHandler(
      fs.createReadStream(tempSmallFilePath),
      path.basename(tempSmallFilePath),
      mime.lookup(tempSmallFilePath),
    )

    const smallFileBuffer = await convertFileStreamIntoBuffer(smallImageStream)

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

// Returns an array of stored objects
// [{
//  type: String (values: original/small/medium),
//  key: String
//  mimetype: String
//  extension: String
//  size: Integer
// }]

const upload = async (fileStream, filename, options = {}) => {
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
      !imageConversionToSupportedFormatMapper.hasOwnProperty(
        getFileExtension(filename),
      )
    ) {
      const storedObject = await uploadFileHandler(
        fileStream,
        hashedFilename,
        mimetype,
      )

      const { ContentLength } = await getFileInfo(storedObject.key)
      storedObject.type = 'original'
      storedObject.size = ContentLength
      storedObject.extension = `${getFileExtension(filename)}`
      storedObject.mimetype = mimetype
      storedObjects.push(storedObject)
      return storedObjects
    }
    /* eslint-enable no-prototype-builtins */

    storedObjects = await handleImageUpload(
      fileStream,
      hashedFilename,
      mimetype,
    )

    return storedObjects
  } catch (e) {
    throw new Error(e)
  }
}

const getFileInfo = key => {
  if (!s3) {
    throw new Error(
      's3 does not exist! Probably configuration is missing/invalid',
    )
  }

  const { bucket } = config.get('fileStorage')

  const params = {
    Bucket: bucket,
    Key: key,
  }

  return new Promise((resolve, reject) => {
    s3.getObject(params, (err, data) => {
      if (err) {
        reject(err)
      }

      resolve(data)
    })
  })
}

const list = () => {
  if (!s3) {
    throw new Error(
      's3 does not exist! Probably configuration is missing/invalid',
    )
  }

  const { bucket } = config.get('fileStorage')

  const params = {
    Bucket: bucket,
  }

  return new Promise((resolve, reject) => {
    s3.listObjects(params, (err, data) => {
      if (err) {
        reject(err)
      }

      resolve(data)
    })
  })
}

// Accepts an array of object keys
const deleteFiles = objectKeys => {
  if (!s3) {
    throw new Error(
      's3 does not exist! Probably configuration is missing/invalid',
    )
  }

  const { bucket, s3SeparateDeleteOperations } = config.get('fileStorage')

  if (objectKeys.length === 0) {
    throw new Error('the provided array of keys if empty')
  }

  const separateDeleteOperations = !emptyUndefinedOrNull(
    s3SeparateDeleteOperations,
  )
    ? JSON.parse(s3SeparateDeleteOperations)
    : false

  if (separateDeleteOperations) {
    return Promise.all(
      objectKeys.map(
        async objectKey =>
          new Promise((resolve, reject) => {
            const params = { Bucket: bucket, Key: objectKey }

            s3.deleteObject(params, (err, data) => {
              if (err) {
                reject(err)
              }

              resolve(data)
            })
          }),
      ),
    )
  }

  const params = {
    Bucket: bucket,
    Delete: {
      Objects: [],
      Quiet: false,
    },
  }

  forEach(objectKeys, objectKey => {
    params.Delete.Objects.push({ Key: objectKey })
  })

  return new Promise((resolve, reject) => {
    s3.deleteObjects(params, (err, data) => {
      if (err) {
        reject(err)
      }

      resolve(data)
    })
  })
}

const download = (key, localPath) => {
  if (!s3) {
    throw new Error(
      's3 does not exist! Probably configuration is missing/invalid',
    )
  }

  const { bucket } = config.get('fileStorage')
  const fileStream = fs.createWriteStream(localPath)
  const s3Stream = s3.getObject({ Bucket: bucket, Key: key }).createReadStream()

  return new Promise((resolve, reject) => {
    // Listen for errors returned by the service
    s3Stream.on('error', err => {
      // NoSuchKey: The specified key does not exist
      reject(err)
    })

    s3Stream
      .pipe(fileStream)
      .on('error', err => {
        // capture any errors that occur when writing data to the file
        reject(err)
        console.error('File Stream:', err)
      })
      .on('close', () => {
        resolve()
      })
  })
}

module.exports = {
  connectToFileStorage,
  healthCheck,
  getURL,
  upload,
  deleteFiles,
  list,
  download,
  uploadFileHandler,
}

const { buffer } = require('stream/consumers')

/**
 * Some light duplication of code in this file, in order to keep it from being
 * a blocker for refactoring or other changes.
 * (eg. we made uploadFileHandler a private method, so it wouldn't be available here)
 */

const mime = require('mime-types')
const fs = require('fs-extra')
const path = require('path')
const sharp = require('sharp')
const config = require('config')
const { Upload } = require('@aws-sdk/lib-storage')

const useTransaction = require('../../useTransaction')
const File = require('../file.model')
const tempFolderPath = require('../../../utils/tempFolderPath')
const fileStorage = require('../../../fileStorage')

const imageSizeConversionMapper = {
  tiff: {
    full: 'png',
  },
  tif: {
    full: 'png',
  },
  svg: {
    full: 'svg',
  },
  png: {
    full: 'png',
  },
  default: {
    full: 'jpeg',
  },
}

const getMetadata = async fileBuffer => {
  try {
    const originalImage = sharp(fileBuffer, { limitInputPixels: false })
    const imageMetadata = await originalImage.metadata()
    return imageMetadata
  } catch (e) {
    throw new Error(e)
  }
}

const sharpConversionFullFilePath = async (
  bufferData,
  tempFileDir,
  filenameWithoutExtension,
  format,
) => {
  await fs.ensureDir(tempFileDir)

  const tempFullFilePath = path.join(
    tempFileDir,
    `${filenameWithoutExtension}_full.${
      imageSizeConversionMapper[format]
        ? imageSizeConversionMapper[format].full
        : imageSizeConversionMapper.default.full
    }`,
  )

  await sharp(bufferData).toFile(tempFullFilePath)

  return tempFullFilePath
}

const uploadFileHandler = async (fileStream, filename, mimetype) => {
  const params = {
    Bucket: fileStorage.bucket,
    Key: filename, // file name you want to save as
    Body: fileStream,
    ContentType: mimetype,
  }

  const upload = new Upload({
    client: fileStorage.s3,
    params,
  })

  // upload.on('httpUploadProgress', progress => {
  //   console.log(progress)
  // })

  const data = await upload.done()

  const { Key } = data
  return { key: Key }
}

exports.up = async () => {
  /**
   * If the app didn't use file storage before or after, this migration is unnecessary.
   *
   * If the app didn't use file storage before this migration, but started using
   * it after, this migration is unnecessary (new files will have a full quallity version).
   *
   * If the app used file storage before this migration, but stopped using it
   * before this migration, it is assumed that the files in file storage are
   * not used any more, so this migration will be skipped.
   *
   * There is an edge case where the app used file storage, stopped for a while,
   * in which period this migration ran, then started using it again, and the
   * files are still used. In this case this migration will need to be run manually.
   */

  if (!(config.has('useFileStorage') && config.get('useFileStorage'))) {
    return true
  }

  try {
    return useTransaction(async trx => {
      const files = await File.query(trx)

      const tempDir = tempFolderPath
      await fs.ensureDir(tempDir)

      await Promise.all(
        files.map(async file => {
          const mimetype = mime.lookup(file.name)

          const fullStoredObject = file.storedObjects.find(
            storedObject => storedObject.type === 'full',
          )

          if (mimetype.match(/^image\//) && !fullStoredObject) {
            const tempFileDir = path.join(tempDir, file.id)
            await fs.ensureDir(tempFileDir)

            const originalStoredObject = file.storedObjects.find(
              storedObject => storedObject.type === 'original',
            )

            const filenameWithoutExtension = path.parse(
              originalStoredObject.key,
            ).name

            const tempPath = path.join(tempFileDir, originalStoredObject.key)

            await fileStorage.download(originalStoredObject.key, tempPath)

            const format = originalStoredObject.extension

            const bufferData = fs.readFileSync(tempPath)

            const tempFullFilePath = await sharpConversionFullFilePath(
              bufferData,
              tempFileDir,
              filenameWithoutExtension,
              format,
            )

            fs.unlinkSync(tempPath)

            const fullImageStream = fs.createReadStream(tempFullFilePath)

            const full = await uploadFileHandler(
              fs.createReadStream(tempFullFilePath),
              path.basename(tempFullFilePath),
              mime.lookup(tempFullFilePath),
            )

            const fullFileBuffer = await buffer(fullImageStream)

            const {
              width: fWidth,
              height: fHeight,
              space: fSpace,
              density: fDensity,
              size: fSize,
            } = await getMetadata(fullFileBuffer)

            full.imageMetadata = {
              density: fDensity,
              height: fHeight,
              space: fSpace,
              width: fWidth,
            }
            full.size = fSize
            full.extension = path.extname(tempFullFilePath).slice(1)
            full.type = 'full'
            full.mimetype = mime.lookup(tempFullFilePath)

            file.storedObjects.push(full)

            await File.query(trx).patchAndFetchById(file.id, {
              storedObjects: file.storedObjects,
            })

            fs.unlinkSync(tempFullFilePath)
          }
        }),
      )

      try {
        await fs.emptyDir(tempDir)
      } catch (e) {
        throw new Error(e)
      }

      return true
    })
  } catch (e) {
    throw new Error(
      `'File: Add full conversion image quality to stored objects migration failed!' ${e}`,
    )
  }
}

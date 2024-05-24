/* eslint-disable import/no-unresolved */
const mime = require('mime-types')
const fs = require('fs-extra')
const path = require('path')
const sharp = require('sharp')
const config = require('config')

const useTransaction = require('../../useTransaction')
const File = require('../file.model')
const tempFolderPath = require('../../../utils/tempFolderPath')

const FileStorage = require('../../../services/fileStorage')

const {
  convertFileStreamIntoBuffer,
  getFileExtension,
  getImageFileMetadata,
} = require('../../../helpers')

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

const sharpConversionFullFilePath = async (
  buffer,
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

  await sharp(buffer).toFile(tempFullFilePath)

  return tempFullFilePath
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

            await FileStorage.download(originalStoredObject.key, tempPath)

            const format = originalStoredObject.extension

            const buffer = fs.readFileSync(tempPath)

            const tempFullFilePath = await sharpConversionFullFilePath(
              buffer,
              tempFileDir,
              filenameWithoutExtension,
              format,
            )

            fs.unlinkSync(tempPath)

            const fullImageStream = fs.createReadStream(tempFullFilePath)

            const full = await FileStorage.uploadFileHandler(
              fs.createReadStream(tempFullFilePath),
              path.basename(tempFullFilePath),
              mime.lookup(tempFullFilePath),
            )

            const fullFileBuffer = await convertFileStreamIntoBuffer(
              fullImageStream,
            )

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

import path from 'path'
import { buffer } from 'stream/consumers'

import fs from 'fs-extra'
import mime from 'mime-types'
import sharp from 'sharp'
import { Upload } from '@aws-sdk/lib-storage'

import config from '../../../configManager/config'
import useTransaction from '../../useTransaction'
import File from '../file.model'
import { tempFolderPath } from '../../../utils/filesystem'
import fileStorage from '../../../fileStorage'
import { type StoredObject } from '../../../fileStorage/types'

/**
 * Some light duplication of code in this file, in order to keep it from being
 * a blocker for refactoring or other changes.
 * (eg. we made uploadFileHandler a private method, so it wouldn't be available here)
 */

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

const getMetadata = async (fileBuffer): Promise<sharp.Metadata> => {
  const originalImage = sharp(fileBuffer, { limitInputPixels: false })
  const imageMetadata = await originalImage.metadata()
  return imageMetadata
}

const sharpConversionFullFilePath = async (
  bufferData,
  tempFileDir,
  filenameWithoutExtension,
  format,
): Promise<string> => {
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

const uploadFileHandler = async (
  fileStream,
  filename,
  mimetype,
): Promise<Partial<StoredObject>> => {
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

export async function up(): Promise<void> {
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

  if (!config.get('fileStorage')) return

  try {
    await useTransaction(async trx => {
      const files = await File.query(trx)

      const tempDir = tempFolderPath
      await fs.ensureDir(tempDir)

      await Promise.all(
        files.map(async file => {
          const mimetype = mime.lookup(file.name)

          const fullStoredObject = file.storedObjects.find(
            storedObject => storedObject.type === 'full',
          )

          if (mimetype && mimetype.match(/^image\//) && !fullStoredObject) {
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

            file.storedObjects.push(full as StoredObject)

            await File.query(trx).patchAndFetchById(file.id, {
              storedObjects: file.storedObjects,
            })

            fs.unlinkSync(tempFullFilePath)
          }
        }),
      )

      await fs.emptyDir(tempDir)
      return true
    })
  } catch (e) {
    throw new Error(
      `'File: Add full conversion image quality to stored objects migration failed!' ${e}`,
    )
  }
}

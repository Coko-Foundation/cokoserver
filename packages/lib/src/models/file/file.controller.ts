import { S3 } from '@aws-sdk/client-s3'
import { Transaction } from 'objection'

import logger from '../../logger'
import File from './file.model'
import useTransaction from '../useTransaction'
import fileStorage from '../../fileStorage'
import FileStorageConstructor from '../../fileStorage/FileStorage'
import { labels } from './constants'
import { StoredObject } from '../../fileStorage/types'

const { FILE_CONTROLLER } = labels

type CreateFileOptions = {
  forceObjectKeyValue?: string
  meta?: object
  public?: boolean
  s3?: S3
  trx?: Transaction
}

type DeleteFileOptions = {
  s3?: S3
  trx?: Transaction
}

const getStorage = connectionConfig => {
  if (!connectionConfig) return fileStorage
  return new FileStorageConstructor(connectionConfig)
}

const createFile = async (
  fileStream,
  name,
  alt = null,
  caption = null,
  tags = [],
  objectId = null,
  options: CreateFileOptions = {},
): Promise<File> => {
  try {
    const { trx, forceObjectKeyValue, s3, public: isPublic, meta } = options

    const storage = getStorage(s3)

    const storedObjects: StoredObject[] = await storage.upload(
      fileStream,
      name,
      {
        forceObjectKeyValue,
        public: isPublic,
      },
    )

    return File.insert(
      {
        name,
        alt,
        caption,
        tags,
        objectId,
        storedObjects,
        meta,
      },
      { trx },
    )
  } catch (e) {
    logger.error(`${FILE_CONTROLLER} createFile: ${e.message}`)
    throw e
  }
}

const deleteFiles = async (
  ids,
  removeFromFileServer = true,
  options: DeleteFileOptions = {},
): Promise<number> => {
  try {
    const { trx, s3 } = options

    const storage = getStorage(s3)

    logger.info(
      `${FILE_CONTROLLER} deleteFiles: deleting files with ids ${ids}`,
    )

    return useTransaction(
      async tr => {
        if (removeFromFileServer) {
          logger.info(
            `${FILE_CONTROLLER} deleteFiles: flag removeFromFileServer is enabled and will trigger permanent deletion of files in file server too`,
          )

          const toBeDeletedFiles = await File.query(tr).findByIds(ids)

          await Promise.all(
            toBeDeletedFiles.map(async deletedFile => {
              const { storedObjects } = deletedFile
              const keys = []
              storedObjects.forEach(storedObject => keys.push(storedObject.key))

              await storage.delete(keys)
            }),
          )
        }

        const affectedRows = await Promise.all(
          ids.map(async id => File.query(tr).deleteById(id)),
        )

        return affectedRows.length
      },
      { trx },
    )
  } catch (e) {
    logger.error(`${FILE_CONTROLLER} deleteFiles: ${e.message}`)
    throw e
  }
}

export { createFile, deleteFiles }

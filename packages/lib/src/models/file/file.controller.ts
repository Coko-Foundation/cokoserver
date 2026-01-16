import { S3 } from '@aws-sdk/client-s3'
import { Transaction } from 'objection'
import { ReadStream } from 'fs'

import logger from '../../logger'
import File from './file.model'
import useTransaction from '../useTransaction'
import fileStorage from '../../fileStorage'
import FileStorageConstructor from '../../fileStorage/FileStorage'
import { labels } from './constants'
import { StoredObject } from '../../fileStorage/types'
import FileStorageNoop from '../../fileStorage/FileStorageNoop'

const { FILE_CONTROLLER } = labels

type CreateFileOptions = {
  alt?: string
  caption?: string
  forceObjectKeyValue?: string
  meta?: object
  objectId?: string
  public?: boolean
  s3?: S3
  tags?: string[]
  trx?: Transaction
}

type DeleteFileOptions = {
  removeFromFileServer?: boolean
  s3?: S3
  trx?: Transaction
}

const getStorage = (
  connectionConfig,
): FileStorageConstructor | FileStorageNoop => {
  if (!connectionConfig) return fileStorage
  return new FileStorageConstructor(connectionConfig)
}

const createFile = async (
  fileStream: ReadStream,
  name: string,
  options: CreateFileOptions = {},
): Promise<File> => {
  try {
    const {
      alt = null,
      caption = null,
      forceObjectKeyValue,
      meta,
      objectId = null,
      public: isPublic,
      s3,
      tags = [],
      trx,
    } = options

    const storage = getStorage(s3) as FileStorageConstructor

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
  ids: string[],
  options: DeleteFileOptions = {},
): Promise<number> => {
  try {
    const { removeFromFileServer = true, trx, s3 } = options

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

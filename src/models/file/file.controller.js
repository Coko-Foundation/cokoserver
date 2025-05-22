const logger = require('../../logger')

const File = require('./file.model')
const useTransaction = require('../useTransaction')

const fileStorage = require('../../fileStorage')
const FileStorageConstructor = require('../../fileStorage/FileStorage')

const {
  labels: { FILE_CONTROLLER },
} = require('./constants')

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
  options = {},
) => {
  try {
    const { trx, forceObjectKeyValue, s3, public: isPublic } = options

    const storage = getStorage(s3)

    const storedObjects = await storage.upload(fileStream, name, {
      forceObjectKeyValue,
      public: isPublic,
    })

    return File.insert(
      {
        name,
        alt,
        caption,
        tags,
        objectId,
        storedObjects,
      },
      { trx },
    )
  } catch (e) {
    logger.error(`${FILE_CONTROLLER} createFile: ${e.message}`)
    throw e
  }
}

const deleteFiles = async (ids, removeFromFileServer = true, options = {}) => {
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

module.exports = {
  createFile,
  deleteFiles,
}

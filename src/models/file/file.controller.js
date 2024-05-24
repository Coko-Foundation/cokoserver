const logger = require('../../logger')

const File = require('./file.model')
const useTransaction = require('../useTransaction')

const FileStorage = require('../../services/fileStorage')

const {
  labels: { FILE_CONTROLLER },
} = require('./constants')

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
    const { trx, forceObjectKeyValue } = options

    logger.info(
      `${FILE_CONTROLLER} createFile: creating a new file representation`,
    )

    return useTransaction(
      async tr => {
        const storedObjects = await FileStorage.upload(fileStream, name, {
          forceObjectKeyValue,
        })

        return File.query(tr).insert({
          name,
          alt,
          caption,
          tags,
          objectId,
          storedObjects,
        })
      },
      {
        trx,
        passedTrxOnly: true,
      },
    )
  } catch (e) {
    logger.error(`${FILE_CONTROLLER} createFile: ${e.message}`)
    throw new Error(e)
  }
}

const deleteFiles = async (ids, removeFromFileServer = true, options = {}) => {
  try {
    const { trx } = options
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

              await FileStorage.deleteFiles(keys)
            }),
          )
        }

        const affectedRows = await Promise.all(
          ids.map(async id => File.query(tr).deleteById(id)),
        )

        return affectedRows.length
      },
      { trx, passedTrxOnly: true },
    )
  } catch (e) {
    logger.error(`${FILE_CONTROLLER} deleteFiles: ${e.message}`)
    throw new Error(e)
  }
}

module.exports = {
  createFile,
  deleteFiles,
}

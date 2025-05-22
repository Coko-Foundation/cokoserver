const { v4: uuid } = require('uuid')

const logger = require('../../logger')
const BaseModel = require('../base.model')
const useTransaction = require('../useTransaction')

const {
  arrayOfStrings,
  stringNullable,
  stringNotEmpty,
  idNullable,
  integerPositive,
  id,
} = require('../_helpers/types')

// Type declaration
const mimetype = {
  type: 'string',
  pattern:
    '^(application|audio|font|image|model|multipart|text|video)/[a-z0-9]+([-+.][a-z0-9]+)*$',
  // if you want to know why this is default, look at
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Complete_list_of_MIME_types
  default: 'application/octet-stream',
}

const arrayOfStoredObjects = {
  type: 'array',
  items: {
    type: 'object',
    additionalProperties: false,
    required: ['type', 'key', 'mimetype', 'extension', 'size'],
    properties: {
      id,
      type: { type: 'string', enum: ['original', 'small', 'medium', 'full'] },
      key: stringNotEmpty,
      mimetype,
      extension: stringNotEmpty,
      imageMetadata: {
        type: ['object', 'null'],
        required: ['height', 'width'],
        additionalProperties: false,
        properties: {
          id,
          density: integerPositive,
          height: integerPositive,
          space: stringNotEmpty,
          width: integerPositive,
        },
      },
      size: integerPositive,
    },
  },
}

class File extends BaseModel {
  constructor(properties) {
    super(properties)
    this.type = 'file'
  }

  static get tableName() {
    return 'files'
  }

  static get schema() {
    return {
      type: 'object',
      required: ['name', 'storedObjects'],
      properties: {
        alt: stringNullable,
        caption: stringNullable,
        name: stringNotEmpty,
        objectId: idNullable,
        storedObjects: arrayOfStoredObjects,
        referenceId: idNullable,
        tags: arrayOfStrings,
        uploadStatus: stringNullable,
      },
    }
  }

  ensureIds() {
    if (this.storedObjects) {
      this.storedObjects.forEach((storedObject, index) => {
        if (!storedObject.id) {
          this.storedObjects[index].id = uuid()
        }

        if (storedObject.imageMetadata) {
          if (!storedObject.imageMetadata.id) {
            this.storedObjects[index].imageMetadata.id = uuid()
          }
        }
      })
    }
  }

  $beforeInsert(queryContext) {
    super.$beforeInsert(queryContext)
    this.ensureIds()
  }

  $beforeUpdate() {
    super.$beforeUpdate()
    this.ensureIds()
  }

  static async getEntityFiles(objectId, options = {}) {
    try {
      const { trx } = options
      return useTransaction(
        async tr => {
          const { result: files } = await File.find({ objectId }, options)
          return files
        },
        { trx, passedTrxOnly: true },
      )
    } catch (e) {
      logger.error('File model: getEntityFiles failed', e)
      throw new Error(
        `File model: Cannot get files for entity with id ${objectId}`,
      )
    }
  }

  getStoredObjectBasedOnType(type) {
    try {
      const found = this.storedObjects.find(o => o.type === type)

      if (!found) {
        throw new Error('Unknown type of stored object provided')
      }

      return found
    } catch (e) {
      throw new Error(e.message)
    }
  }
}

module.exports = File

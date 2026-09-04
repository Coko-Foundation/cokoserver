import { v4 as uuid } from 'uuid'

import logger from '../../logger'
import BaseModel, { TrxOption } from '../base.model'
import useTransaction from '../useTransaction'

import {
  arrayOfStrings,
  stringNullable,
  stringNotEmpty,
  idNullable,
  integerPositive,
  id,
  objectDefaultEmpty,
} from '../_helpers/types'

type ImageMetadata = {
  id?: string
  density?: number
  height: number
  space?: string
  width: number
}

type StoredObject = {
  id?: string
  extension: string
  imageMetadata?: ImageMetadata
  key: string
  mimetype: string | false
  size: number
  type: string
}

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
  alt!: string
  caption!: string
  meta!: object
  name!: string
  objectId!: string
  storedObjects!: StoredObject[]
  referenceId!: string
  tags!: string[]
  uploadStatus!: string

  constructor() {
    super()
    this.type = 'file'
  }

  static get tableName(): string {
    return 'files'
  }

  static get schema(): object {
    return {
      type: 'object',
      required: ['name', 'storedObjects'],
      properties: {
        alt: stringNullable,
        caption: stringNullable,
        meta: objectDefaultEmpty,
        name: stringNotEmpty,
        objectId: idNullable,
        storedObjects: arrayOfStoredObjects,
        referenceId: idNullable,
        tags: arrayOfStrings,
        uploadStatus: stringNullable,
      },
    }
  }

  ensureIds(): void {
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

  $beforeInsert(): void {
    super.$beforeInsert()
    this.ensureIds()
  }

  $beforeUpdate(): void {
    super.$beforeUpdate()
    this.ensureIds()
  }

  static async getEntityFiles(
    objectId: string,
    options: TrxOption = {},
  ): Promise<File[]> {
    try {
      return useTransaction(
        async tr => {
          const { result: files } = await File.find({ objectId }, { trx: tr })
          return files
        },
        { trx: options.trx, passedTrxOnly: true },
      )
    } catch (e) {
      logger.error('File model: getEntityFiles failed', e)
      throw new Error(
        `File model: Cannot get files for entity with id ${objectId}`,
      )
    }
  }

  getStoredObjectBasedOnType(type: string): StoredObject {
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

export default File

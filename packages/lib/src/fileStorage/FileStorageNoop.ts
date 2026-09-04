/* eslint-disable class-methods-use-this */

import { S3 } from '@aws-sdk/client-s3'

class FileStorageNoop {
  bucket: string
  imageConversionToSupportedFormatMapper = { eps: 'svg' }
  s3: S3
  separateDeleteOperations: boolean
  url: string

  static error(): void {
    throw new Error(
      'Cannot use the FileStorage class when useFileStorage is false in the config',
    )
  }

  delete(): void {
    FileStorageNoop.error()
  }

  download(): void {
    FileStorageNoop.error()
  }

  getFileInfo(): void {
    FileStorageNoop.error()
  }

  getURL(): void {
    FileStorageNoop.error()
  }

  getPublicURL(): void {
    FileStorageNoop.error()
  }

  handleImageUpload(): void {
    FileStorageNoop.error()
  }

  healthCheck(): void {
    FileStorageNoop.error()
  }

  list(): void {
    FileStorageNoop.error()
  }

  upload(): void {
    FileStorageNoop.error()
  }
}

export default FileStorageNoop

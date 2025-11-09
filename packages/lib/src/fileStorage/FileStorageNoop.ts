/* eslint-disable class-methods-use-this */

class FileStorageNoop {
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

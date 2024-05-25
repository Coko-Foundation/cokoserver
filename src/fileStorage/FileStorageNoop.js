class FileStorageNoop {
  static error() {
    throw new Error(
      'Cannot use the FileStorage class when useFileStorage is false in the config',
    )
  }

  delete() {
    this.error()
  }

  download() {
    this.error()
  }

  getFileInfo() {
    this.error()
  }

  getUrl() {
    this.error()
  }

  handleImageUpload() {
    this.error()
  }

  healthCheck() {
    this.error()
  }

  list() {
    this.error()
  }

  upload() {
    this.error()
  }
}

module.exports = FileStorageNoop

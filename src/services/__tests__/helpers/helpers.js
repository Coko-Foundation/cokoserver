const fs = require('fs-extra')
const path = require('path')

const FileStorage = require('../../fileStorage')

const uploadOneFile = async () => {
  const filePath = path.join(
    process.cwd(),
    'src',
    'services',
    '__tests__',
    'files',
    'helloWorld.txt',
  )

  const fileStream = fs.createReadStream(filePath)
  const file = await FileStorage.upload(fileStream, 'helloWorld.txt')
  return file[0]
}

const cleanBucket = async () => {
  const allFiles = await FileStorage.list()
  const { Contents } = allFiles
  const fileKeys = Contents.map(file => file.Key)

  if (fileKeys.length > 0) {
    return FileStorage.deleteFiles(fileKeys)
  }

  return true
}

module.exports = { uploadOneFile, cleanBucket }

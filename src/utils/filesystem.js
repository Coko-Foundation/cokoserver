const path = require('path')
const { buffer } = require('stream/consumers')

const fs = require('fs-extra')

const tempFolderPath = require('./tempFolderPath')

const writeFileToTemp = async (readStream, filePath) => {
  const outputPath = path.join(tempFolderPath, filePath)
  await fs.ensureFile(outputPath)
  const dataBuffer = await buffer(readStream)
  await fs.outputFile(outputPath, dataBuffer)
}

const deleteFileFromTemp = async filePath => {
  const deletePath = path.join(tempFolderPath, filePath)
  await fs.remove(deletePath)
}

const emptyTemp = async () => {
  await fs.emptyDir(tempFolderPath)
}

module.exports = {
  deleteFileFromTemp,
  emptyTemp,
  writeFileToTemp,
}

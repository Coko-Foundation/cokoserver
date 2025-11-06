import path from 'path'
import { buffer } from 'stream/consumers'

import fs from 'fs-extra'

import tempFolderPath from './tempFolderPath'

const findConfigurationFile = (filename, options = {}) => {
  const extensions = options.extensions || ['js', 'ts']
  const basePath = options.basePath
    ? path.join(process.cwd(), options.basePath)
    : process.cwd()

  const foundFiles = extensions.reduce((found, ext) => {
    const searchPath = path.join(basePath, `${filename}.${ext}`)
    const exists = fs.existsSync(searchPath)

    if (exists) found.push(searchPath)
    return found
  }, [])

  if (foundFiles.length === 0) return null

  if (foundFiles.length > 1) {
    throw new Error(
      `More than one files named ${filename} found at ${basePath}.`,
    )
  }

  return foundFiles[0]
}

const writeFileToTemp = async (readStream, filePath) => {
  const outputPath = path.join(tempFolderPath, filePath)
  await fs.ensureFile(outputPath)

  const isBase64 =
    typeof readStream === 'string' &&
    readStream.match(/[^:]\w+\/[\w\-+.]+(?=;base64,)/)

  let dataBuffer

  if (isBase64) {
    dataBuffer = Buffer.from(
      readStream.replace(/^data:.*;base64,/, ''),
      'base64',
    )
  } else {
    dataBuffer = await buffer(readStream)
  }

  await fs.outputFile(outputPath, dataBuffer)
}

const deleteFileFromTemp = async filePath => {
  const deletePath = path.join(tempFolderPath, filePath)
  await fs.remove(deletePath)
}

const emptyTemp = async () => {
  await fs.emptyDir(tempFolderPath)
}

export { findConfigurationFile, deleteFileFromTemp, emptyTemp, writeFileToTemp }

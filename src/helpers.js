const path = require('path')
const sharp = require('sharp')
const fs = require('fs-extra')

const emptyUndefinedOrNull = value => {
  return (
    value == null || (typeof value === 'string' && value.trim().length === 0)
  )
}

const convertFileStreamIntoBuffer = async fileStream => {
  return new Promise((resolve, reject) => {
    // Store file data chunks
    const chunks = []

    // Throw if error occurred
    fileStream.on('error', err => {
      reject(err)
    })

    // File is done being read
    fileStream.on('end', () => {
      // create the final data Buffer from data chunks;
      resolve(Buffer.concat(chunks))
    })

    // Data is flushed from fileStream in chunks,
    // this callback will be executed for each chunk
    fileStream.on('data', chunk => {
      chunks.push(chunk) // push data chunk to array
    })
  })
}

const getFileExtension = (filename, includingDot = false) => {
  const { ext } = path.parse(filename)
  if (!includingDot) return ext.split('.')[1]
  return ext
}

const getImageFileMetadata = async fileBuffer => {
  try {
    const originalImage = sharp(fileBuffer, { limitInputPixels: false })
    const imageMetadata = await originalImage.metadata()
    return imageMetadata
  } catch (e) {
    throw new Error(e)
  }
}

const writeFileFromStream = async (inputStream, filePath) => {
  try {
    return new Promise((resolve, reject) => {
      const outputStream = fs.createWriteStream(filePath)

      inputStream.pipe(outputStream)
      outputStream.on('error', error => {
        reject(error.message)
      })

      outputStream.on('finish', () => {
        resolve()
      })
    })
  } catch (e) {
    throw new Error(e)
  }
}

module.exports = {
  convertFileStreamIntoBuffer,
  getFileExtension,
  getImageFileMetadata,
  writeFileFromStream,
  emptyUndefinedOrNull,
}

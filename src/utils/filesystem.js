const fs = require('fs-extra')

// const tempFolderPath = require('../utils/tempFolderPath')

const writeFileFromStream = async (inputStream, filePath) => {
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
}

// const writeFileToTemp = async (readStream, filePath) => {
//   return new Promise((resolve, reject) => {

//     const outputStream = fs.createWriteStream(filePath)

//     readStream.pipe(outputStream)

//     outputStream.on('error', error => {
//       reject(error.message)
//     })

//     outputStream.on('finish', () => {
//       resolve()
//     })
//   })
// }

module.exports = {
  writeFileFromStream,
}

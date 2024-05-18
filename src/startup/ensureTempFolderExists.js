const fs = require('fs')

const logger = require('../logger')
const tempFolderPath = require('../utils/tempFolderPath')

const ensureTempFolderExists = () => {
  logger.info('Ensuring "tmp" folder exists...')

  fs.stat(tempFolderPath, (err, stats) => {
    if (err || !stats.isDirectory()) {
      logger.info(
        '[ensureTempFolderExists]: "tmp" folder does not exist. Creating...',
      )
      fs.mkdirSync(tempFolderPath)
      logger.info('[ensureTempFolderExists]: "tmp" folder created')
    } else {
      logger.info('[ensureTempFolderExists]: "tmp" folder already exists')
    }
  })
}

module.exports = ensureTempFolderExists

const fs = require('fs-extra')

const { logTask, logTaskItem } = require('../logger/internals')
const tempFolderPath = require('../utils/tempFolderPath')

const ensureTempFolderExists = async () => {
  logTask(`Ensure tmp folder exists`)
  await fs.ensureDir(tempFolderPath)
  logTaskItem(`tmp folder now exists`)
}

module.exports = ensureTempFolderExists

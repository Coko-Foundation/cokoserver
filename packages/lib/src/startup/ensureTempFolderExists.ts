import fs from 'fs-extra'

import { logTask, logTaskItem } from '../logger/internals'
import tempFolderPath from '../utils/tempFolderPath'

const ensureTempFolderExists = async () => {
  logTask(`Ensure tmp folder exists`)
  await fs.ensureDir(tempFolderPath)
  logTaskItem(`tmp folder now exists`)
}

export default ensureTempFolderExists

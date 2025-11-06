import path from 'path'
import express, { Express } from 'express'

import config from '../configManager/config'
import { logTask, logTaskItem } from '../logger/internals'

const mountStatic = (app: Express): void => {
  logTask('Mounting static folders')

  const staticFolders =
    (config.has('staticFolders') && config.get('staticFolders')) || []

  if (staticFolders.length === 0) {
    logTaskItem('No static folders defined.')
  }

  staticFolders.forEach(item => {
    const { mountPoint, folderPath } = item
    app.use(mountPoint, express.static(path.resolve(folderPath)))
    logTaskItem(`Mounted folder ${folderPath} at ${mountPoint}`)
  })
}

export default mountStatic

import path from 'path'
import express, { Express } from 'express'

import config from '../configManager/config'
import internalLogger from '../logger/internals'

const mountStatic = (app: Express): void => {
  internalLogger.section('Mounting static folders')

  const staticFolders =
    (config.has('staticFolders') && config.get('staticFolders')) || []

  if (staticFolders.length === 0) {
    internalLogger.point('No static folders defined.')
  }

  staticFolders.forEach(item => {
    const { mountPoint, folderPath } = item
    app.use(mountPoint, express.static(path.resolve(folderPath)))
    internalLogger.success(`Mounted folder ${folderPath} at ${mountPoint}`)
  })
}

export default mountStatic

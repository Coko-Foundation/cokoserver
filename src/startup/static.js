const path = require('path')
const config = require('config')
const express = require('express')

const { logTask, logTaskItem } = require('../logger/internals')

const mountStatic = app => {
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

module.exports = mountStatic

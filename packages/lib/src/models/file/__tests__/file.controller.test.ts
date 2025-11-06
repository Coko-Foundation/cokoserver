import { describe, beforeEach, afterAll, it, expect } from 'vitest'
import { v4 as uuid } from 'uuid'
import fs from 'fs-extra'
import path from 'path'

import File from '../file.model'
import { deleteFiles, createFile } from '../file.controller'
import clearDb from '../../_helpers/clearDb'
import tempFolderPath from '../../../utils/tempFolderPath'

const testFilePath = path.join(
  __dirname,
  '..',
  '..',
  '..',
  'fileStorage',
  '__tests__',
  'files',
)

describe('File Controller', () => {
  beforeEach(() => clearDb())

  afterAll(async () => {
    const knex = File.knex()
    knex.destroy()

    await fs.emptyDir(tempFolderPath)
  })

  it('creates a file', async () => {
    const filePath = path.join(testFilePath, 'test.jpg')
    const fileStream = fs.createReadStream(filePath)
    const newFile = await createFile(fileStream, 'test.jpg')

    expect(newFile).toBeDefined()
    expect(newFile.storedObjects).toHaveLength(4)
    expect(newFile.name).toEqual('test.jpg')
  })

  it('creates a file and forces specific object key', async () => {
    const filePath = path.join(testFilePath, 'test.jpg')
    const fileStream = fs.createReadStream(filePath)

    const newFile = await createFile(
      fileStream,
      'test.jpg',
      null,
      null,
      [],
      null,
      { forceObjectKeyValue: 'specific.jpg' },
    )

    expect(newFile).toBeDefined()
    expect(newFile.storedObjects).toHaveLength(4)
    expect(newFile.name).toEqual('test.jpg')
    expect(newFile.storedObjects[0].key).toEqual('specific.jpg')
  })

  it('deletes files', async () => {
    const newFile1 = await File.insert({
      name: 'test.txt',
      objectId: uuid(),
      storedObjects: [
        {
          key: '1ac468ab084d.txt',
          type: 'original',
          mimetype: 'text/plain',
          extension: 'txt',
          imageMetadata: null,
          size: 25,
        },
      ],
    })

    const newFile2 = await File.insert({
      name: 'test2.txt',
      objectId: uuid(),
      storedObjects: [
        {
          key: '1ac468ab0asdasd84d.txt',
          type: 'original',
          mimetype: 'text/plain',
          extension: 'txt',
          imageMetadata: null,
          size: 25,
        },
      ],
    })

    const affectedRows = await deleteFiles([newFile1.id, newFile2.id])

    expect(affectedRows).toBe(2)
  })
})

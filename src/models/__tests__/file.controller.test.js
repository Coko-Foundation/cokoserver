const { v4: uuid } = require('uuid')
const fs = require('fs-extra')
const path = require('path')

const File = require('../file/file.model')
const { deleteFiles, createFile } = require('../file/file.controller')
// const FileStorage = require('../../services/fileStorage')
const clearDb = require('./_clearDb')

describe('File Controller', () => {
  beforeEach(() => clearDb())

  afterAll(() => {
    const knex = File.knex()
    knex.destroy()
  })

  it('creates a file', async () => {
    const filePath = path.join(
      process.cwd(),
      'src',
      'services',
      '__tests__',
      'files',
      'test.jpg',
    )

    const fileStream = fs.createReadStream(filePath)
    const newFile = await createFile(fileStream, 'test.jpg')

    expect(newFile).toBeDefined()
    expect(newFile.storedObjects).toHaveLength(4)
    expect(newFile.name).toEqual('test.jpg')
  })

  it('creates a file and forces specific object key', async () => {
    const filePath = path.join(
      process.cwd(),
      'src',
      'services',
      '__tests__',
      'files',
      'test.jpg',
    )

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

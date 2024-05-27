const fs = require('fs-extra')
const path = require('path')

const fileStorage = require('../index')
const FileStorageConstructor = require('../FileStorage')
const tempFolderPath = require('../../utils/tempFolderPath')

const testFilePath = path.join(__dirname, 'files')

const uploadOneFile = async () => {
  const filePath = path.join(testFilePath, 'helloWorld.txt')
  const fileStream = fs.createReadStream(filePath)
  const file = await fileStorage.upload(fileStream, 'helloWorld.txt')
  return file[0]
}

const cleanBucket = async () => {
  const list = await fileStorage.list()
  const { Contents } = list

  if (!Contents) return true // bucket is empty already

  const fileKeys = Contents.map(file => file.Key)

  if (fileKeys.length > 0) {
    return fileStorage.delete(fileKeys)
  }

  return true
}

describe('File Storage Service', () => {
  beforeEach(() => {
    cleanBucket()
  })

  afterAll(async () => {
    await fs.emptyDir(tempFolderPath)
  })

  it('communicates with file server', async () => {
    const fileServerHealth = await fileStorage.healthCheck()
    expect(fileServerHealth).toBeDefined()
  })

  it('uploads a file', async () => {
    const filePath = path.join(testFilePath, 'helloWorld.txt')
    const fileStream = fs.createReadStream(filePath)
    const storedObject = await fileStorage.upload(fileStream, 'helloWorld.txt')
    expect(storedObject).toHaveLength(1)
  })

  it('uploads a not common extension file', async () => {
    const filePath = path.join(testFilePath, 'entry.njk')
    const fileStream = fs.createReadStream(filePath)
    const storedObject = await fileStorage.upload(fileStream, 'entry.njk')
    expect(storedObject).toHaveLength(1)
    expect(storedObject[0].mimetype).toBe('application/octet-stream')
  })

  it('uploads an jpg image file', async () => {
    const filePath = path.join(testFilePath, 'test.jpg')
    const fileStream = fs.createReadStream(filePath)
    const storedObject = await fileStorage.upload(fileStream, 'test.jpg')
    expect(storedObject).toHaveLength(4)
  })

  it('uploads a png image file', async () => {
    const filePath = path.join(testFilePath, 'test.png')
    const fileStream = fs.createReadStream(filePath)
    const storedObject = await fileStorage.upload(fileStream, 'test.png')
    expect(storedObject).toHaveLength(4)
  })

  it('uploads a tiff image file and checks the original and converted file types', async () => {
    const filePath = path.join(testFilePath, 'test.tiff')
    const fileStream = fs.createReadStream(filePath)
    const storedObject = await fileStorage.upload(fileStream, 'test.tiff')

    expect(storedObject).toHaveLength(4)

    expect(storedObject).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'original', extension: 'tiff' }),
        expect.objectContaining({ type: 'full', extension: 'png' }),
        expect.objectContaining({ type: 'medium', extension: 'png' }),
        expect.objectContaining({ type: 'small', extension: 'png' }),
      ]),
    )
  })

  it('uploads an svg image file', async () => {
    const filePath = path.join(testFilePath, 'test.svg')
    const fileStream = fs.createReadStream(filePath)
    const storedObject = await fileStorage.upload(fileStream, 'test.svg')
    expect(storedObject).toHaveLength(4)
  })

  it('uploads an eps image file', async () => {
    const filePath = path.join(testFilePath, 'test.eps')
    const fileStream = fs.createReadStream(filePath)
    const storedObject = await fileStorage.upload(fileStream, 'test.eps')

    expect(storedObject).toHaveLength(4)
  })

  it('provides signed URLs for given operation and object key', async () => {
    const file = await uploadOneFile()
    const { key } = file
    const signed = await fileStorage.getURL(key)
    expect(signed).toBeDefined()
  })

  it('provides a list of all the files of the bucket', async () => {
    const file = await uploadOneFile()
    const { key } = file
    const files = await fileStorage.list()
    expect(files.Contents).toHaveLength(1)
    expect(files.Contents[0].Key).toEqual(key)
  })

  it('downloads locally the given file', async () => {
    const file = await uploadOneFile()
    const tempPath = path.join(tempFolderPath, `${file.key}`)

    await fileStorage.download(file.key, tempPath)
    expect(fs.existsSync(tempPath)).toBe(true)

    const content = await fs.readFile(tempPath, 'utf8')
    expect(content).toBe('This is a dummy text file')
  })

  it('deletes a single file', async () => {
    const file = await uploadOneFile()

    const list = await fileStorage.list()
    expect(list.Contents.length).toBe(1)

    await fileStorage.delete(file.key)

    const updatedList = await fileStorage.list()
    expect(updatedList.Contents).not.toBeDefined()
  })

  it('deletes multiple files', async () => {
    const files = await Promise.all(
      Array.from(Array(2)).map(async () => {
        return uploadOneFile()
      }),
    )

    const list = await fileStorage.list()
    expect(list.Contents.length).toBe(2)

    const keys = files.map(f => f.key)
    await fileStorage.delete(keys)

    const updatedList = await fileStorage.list()
    expect(updatedList.Contents).not.toBeDefined()
  })

  it('deletes files when separateDeleteOperations is true', async () => {
    const ModifiedFS = new FileStorageConstructor({
      separateDeleteOperations: true,
    })

    const files = await Promise.all(
      Array.from(Array(2)).map(async () => {
        return uploadOneFile()
      }),
    )

    const list = await ModifiedFS.list()
    expect(list.Contents.length).toBe(2)

    const keys = files.map(f => f.key)
    await ModifiedFS.delete(keys)

    const updatedList = await ModifiedFS.list()
    expect(updatedList.Contents).not.toBeDefined()
  })

  it('throws if delete is called with no arguments', async () => {
    await expect(fileStorage.delete()).rejects.toThrow(
      'No keys provided. Nothing to delete.',
    )
  })

  it('throws if array of keys is empty', async () => {
    await expect(fileStorage.delete([])).rejects.toThrow(
      'No keys provided. Nothing to delete.',
    )
  })

  it('hides private methods', async () => {
    // sanity checl that it returns true on non-private methods
    expect('upload' in FileStorageConstructor.prototype).toBe(true)

    expect('getFileInfo' in FileStorageConstructor.prototype).toBe(false)
  })
})

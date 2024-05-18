const fs = require('fs-extra')
const path = require('path')

const {
  connectToFileStorage,
  healthCheck,
  upload,
  getURL,
  list,
  download,
} = require('../fileStorage')

const { uploadOneFile, cleanBucket } = require('./helpers/helpers')
const tempFolderPath = require('../../utils/tempFolderPath')

describe('File Storage Service', () => {
  beforeAll(async () => {
    await connectToFileStorage()
  })

  beforeEach(() => {
    cleanBucket()
  })

  afterAll(async () => {
    await fs.emptyDir(tempFolderPath)
  })

  it('communicates with file server', async () => {
    const fileServerHealth = await healthCheck()
    expect(fileServerHealth).toBeDefined()
  })

  it('uploads a file', async () => {
    const filePath = path.join(
      process.cwd(),
      'src',
      'services',
      '__tests__',
      'files',
      'helloWorld.txt',
    )

    const fileStream = fs.createReadStream(filePath)
    const storedObject = await upload(fileStream, 'helloWorld.txt')
    expect(storedObject).toHaveLength(1)
  })

  it('uploads a not common extension file', async () => {
    const filePath = path.join(
      process.cwd(),
      'src',
      'services',
      '__tests__',
      'files',
      'entry.njk',
    )

    const fileStream = fs.createReadStream(filePath)
    const storedObject = await upload(fileStream, 'entry.njk')
    expect(storedObject).toHaveLength(1)
    expect(storedObject[0].mimetype).toBe('application/octet-stream')
  })

  it('uploads an jpg image file', async () => {
    const filePath = path.join(
      process.cwd(),
      'src',
      'services',
      '__tests__',
      'files',
      'test.jpg',
    )

    const fileStream = fs.createReadStream(filePath)
    const storedObject = await upload(fileStream, 'test.jpg')
    expect(storedObject).toHaveLength(4)
  })

  it('uploads an png image file', async () => {
    const filePath = path.join(
      process.cwd(),
      'src',
      'services',
      '__tests__',
      'files',
      'test.png',
    )

    const fileStream = fs.createReadStream(filePath)
    const storedObject = await upload(fileStream, 'test.png')
    expect(storedObject).toHaveLength(4)
  })

  it('uploads a tiff image file and checks the original and converted file types', async () => {
    const filePath = path.join(
      process.cwd(),
      'src',
      'services',
      '__tests__',
      'files',
      'test.tiff',
    )

    const fileStream = fs.createReadStream(filePath)
    const storedObject = await upload(fileStream, 'test.tiff')

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
    const filePath = path.join(
      process.cwd(),
      'src',
      'services',
      '__tests__',
      'files',
      'test.svg',
    )

    const fileStream = fs.createReadStream(filePath)
    const storedObject = await upload(fileStream, 'test.svg')
    expect(storedObject).toHaveLength(4)
  })

  it('uploads an eps image file', async () => {
    const filePath = path.join(
      process.cwd(),
      'src',
      'services',
      '__tests__',
      'files',
      'test.eps',
    )

    const fileStream = fs.createReadStream(filePath)
    const storedObject = await upload(fileStream, 'test.eps')

    expect(storedObject).toHaveLength(4)
  })

  it('provides signed URLs for given operation and object key', async () => {
    const file = await uploadOneFile()
    const { key } = file
    const signed = await getURL(key)
    expect(signed).toBeDefined()
  })

  it('provides a list of all the files of the bucket', async () => {
    const file = await uploadOneFile()
    const { key } = file
    const files = await list()
    expect(files.Contents).toHaveLength(1)
    expect(files.Contents[0].Key).toEqual(key)
  })

  it('downloads locally the given file', async () => {
    const file = await uploadOneFile()
    const tempPath = path.join(tempFolderPath, `${file.key}`)

    await download(file.key, tempPath)
    expect(fs.existsSync(tempPath)).toBe(true)
  })
})

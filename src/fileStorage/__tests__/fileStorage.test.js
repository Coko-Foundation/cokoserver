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

  it('uploads base64 image data', async () => {
    const data =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAApgAAAKYB3X3/OAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAANCSURBVEiJtZZPbBtFFMZ/M7ubXdtdb1xSFyeilBapySVU8h8OoFaooFSqiihIVIpQBKci6KEg9Q6H9kovIHoCIVQJJCKE1ENFjnAgcaSGC6rEnxBwA04Tx43t2FnvDAfjkNibxgHxnWb2e/u992bee7tCa00YFsffekFY+nUzFtjW0LrvjRXrCDIAaPLlW0nHL0SsZtVoaF98mLrx3pdhOqLtYPHChahZcYYO7KvPFxvRl5XPp1sN3adWiD1ZAqD6XYK1b/dvE5IWryTt2udLFedwc1+9kLp+vbbpoDh+6TklxBeAi9TL0taeWpdmZzQDry0AcO+jQ12RyohqqoYoo8RDwJrU+qXkjWtfi8Xxt58BdQuwQs9qC/afLwCw8tnQbqYAPsgxE1S6F3EAIXux2oQFKm0ihMsOF71dHYx+f3NND68ghCu1YIoePPQN1pGRABkJ6Bus96CutRZMydTl+TvuiRW1m3n0eDl0vRPcEysqdXn+jsQPsrHMquGeXEaY4Yk4wxWcY5V/9scqOMOVUFthatyTy8QyqwZ+kDURKoMWxNKr2EeqVKcTNOajqKoBgOE28U4tdQl5p5bwCw7BWquaZSzAPlwjlithJtp3pTImSqQRrb2Z8PHGigD4RZuNX6JYj6wj7O4TFLbCO/Mn/m8R+h6rYSUb3ekokRY6f/YukArN979jcW+V/S8g0eT/N3VN3kTqWbQ428m9/8k0P/1aIhF36PccEl6EhOcAUCrXKZXXWS3XKd2vc/TRBG9O5ELC17MmWubD2nKhUKZa26Ba2+D3P+4/MNCFwg59oWVeYhkzgN/JDR8deKBoD7Y+ljEjGZ0sosXVTvbc6RHirr2reNy1OXd6pJsQ+gqjk8VWFYmHrwBzW/n+uMPFiRwHB2I7ih8ciHFxIkd/3Omk5tCDV1t+2nNu5sxxpDFNx+huNhVT3/zMDz8usXC3ddaHBj1GHj/As08fwTS7Kt1HBTmyN29vdwAw+/wbwLVOJ3uAD1wi/dUH7Qei66PfyuRj4Ik9is+hglfbkbfR3cnZm7chlUWLdwmprtCohX4HUtlOcQjLYCu+fzGJH2QRKvP3UNz8bWk1qMxjGTOMThZ3kvgLI5AzFfo379UAAAAASUVORK5CYII='

    const storedObject = await fileStorage.upload(data, 'base64.png')
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
    const ModifiedFS = new FileStorageConstructor(null, {
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

  it('replaces a file with the same key', async () => {
    const filePath = path.join(testFilePath, 'helloWorld.txt')
    const fileStream = fs.createReadStream(filePath)

    const storedObjects = await fileStorage.upload(fileStream, 'helloWorld.txt')
    const { key } = storedObjects[0]

    let allFiles = await fileStorage.list()
    expect(allFiles.Contents).toHaveLength(1)

    const anotherFilePath = path.join(testFilePath, 'helloWorld.txt')
    const anotherFileStream = fs.createReadStream(anotherFilePath)

    await fileStorage.upload(anotherFileStream, 'helloWorld.txt', {
      forceObjectKeyValue: key,
    })

    allFiles = await fileStorage.list()
    expect(allFiles.Contents).toHaveLength(1)
    expect(allFiles.Contents[0].Key).toEqual(key)
  })
})

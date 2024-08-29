const path = require('path')
const fs = require('fs-extra')

const {
  deleteFileFromTemp,
  emptyTemp,
  writeFileToTemp,
} = require('../filesystem')

const tempFolderPath = require('../tempFolderPath')

const filePath = path.join(__dirname, '_helpers', 'test.txt')

describe('Filesystem utils', () => {
  it('writes file to temp', async () => {
    const readStream = fs.createReadStream(filePath)
    const outputPath = 'output.txt'

    await writeFileToTemp(readStream, outputPath)

    const newPath = path.join(tempFolderPath, outputPath)
    const fileExists = await fs.pathExists(newPath)
    expect(fileExists).toBe(true)

    const data = await fs.readFile(newPath, 'utf-8')
    expect(data).toEqual('hello world')

    await fs.remove(newPath)
  })

  it('writes file to temp in a nested folder', async () => {
    const readStream = fs.createReadStream(filePath)
    const outputPath = 'someFolder/output.txt'

    await writeFileToTemp(readStream, outputPath)

    const newPath = path.join(tempFolderPath, outputPath)
    const fileExists = await fs.pathExists(newPath)
    expect(fileExists).toBe(true)

    const data = await fs.readFile(newPath, 'utf-8')
    expect(data).toEqual('hello world')

    await fs.remove(newPath)
    await fs.remove(path.join(tempFolderPath, 'someFolder'))
  })

  it('deletes file from temp', async () => {
    const readStream = fs.createReadStream(filePath)
    const outputPath = 'output.txt'

    await writeFileToTemp(readStream, outputPath)

    const newPath = path.join(tempFolderPath, outputPath)
    let fileExists = await fs.pathExists(newPath)
    expect(fileExists).toBe(true)

    await deleteFileFromTemp(outputPath)
    fileExists = await fs.pathExists(newPath)
    expect(fileExists).toBe(false)
  })

  it('empties the temp folder', async () => {
    const n = 3

    await Promise.all(
      Array.from(Array(n)).map(async (_, i) => {
        const readStream = fs.createReadStream(filePath)
        await writeFileToTemp(readStream, `output-${i + 1}.txt`)
      }),
    )

    const files = await fs.readdir(tempFolderPath)

    expect(files).toHaveLength(3)
    expect(files).toEqual(['output-1.txt', 'output-2.txt', 'output-3.txt'])

    await emptyTemp()

    const filesAfter = await fs.readdir(tempFolderPath)
    expect(filesAfter).toHaveLength(0)
  })
})

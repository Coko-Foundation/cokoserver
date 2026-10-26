import { describe, it, expect } from 'vitest'
import path from 'path'
import fs from 'fs'
import { readFile, readdir, rm } from 'fs/promises'

import {
  deleteFileFromTemp,
  emptyTemp,
  writeFileToTemp,
  tempFolderPath,
} from '../filesystem'

const filePath = path.join(__dirname, '_helpers', 'test.txt')

describe('Filesystem utils', () => {
  it('writes file to temp', async () => {
    const readStream = fs.createReadStream(filePath)
    const outputPath = 'output.txt'

    await writeFileToTemp(readStream, outputPath)

    const newPath = path.join(tempFolderPath, outputPath)
    const fileExists = fs.existsSync(newPath)
    expect(fileExists).toBe(true)

    const data = await readFile(newPath, 'utf-8')
    expect(data).toEqual('hello world')

    await rm(newPath)
  })

  it('writes file to temp in a nested folder', async () => {
    const readStream = fs.createReadStream(filePath)
    const outputPath = 'someFolder/output.txt'

    await writeFileToTemp(readStream, outputPath)

    const newPath = path.join(tempFolderPath, outputPath)
    const fileExists = fs.existsSync(newPath)
    expect(fileExists).toBe(true)

    const data = await readFile(newPath, 'utf-8')
    expect(data).toEqual('hello world')

    await rm(newPath)
    await rm(path.join(tempFolderPath, 'someFolder'), { recursive: true })
  })

  it('deletes file from temp', async () => {
    const readStream = fs.createReadStream(filePath)
    const outputPath = 'output.txt'

    await writeFileToTemp(readStream, outputPath)

    const newPath = path.join(tempFolderPath, outputPath)
    let fileExists = fs.existsSync(newPath)
    expect(fileExists).toBe(true)

    await deleteFileFromTemp(outputPath)
    fileExists = fs.existsSync(newPath)
    expect(fileExists).toBe(false)
  })

  it('empties the temp folder', async () => {
    await emptyTemp()
    const initFiles = await readdir(tempFolderPath)
    expect(initFiles).toHaveLength(0)

    const n = 3

    await Promise.all(
      Array.from(Array(n)).map(async (_, i) => {
        const readStream = fs.createReadStream(filePath)
        await writeFileToTemp(readStream, `output-${i + 1}.txt`)
      }),
    )

    const files = await readdir(tempFolderPath)

    expect(files).toHaveLength(3)
    expect(files).toEqual(['output-1.txt', 'output-2.txt', 'output-3.txt'])

    await emptyTemp()

    const filesAfter = await readdir(tempFolderPath)
    expect(filesAfter).toHaveLength(0)
  })
})

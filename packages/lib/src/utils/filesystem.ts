import path from 'path'
import { buffer } from 'stream/consumers'

import fs, { ReadStream } from 'fs-extra'

type FindConfigurationFileOptions = {
  extensions?: string[]
  basePath?: string
}

const tempFolderPath = path.join(process.cwd(), 'tmp')

// returns path
const findConfigurationFile = (
  filename: string,
  options: FindConfigurationFileOptions = {},
): string => {
  const extensions = options.extensions || ['js', 'ts']
  const basePath = options.basePath
    ? path.join(process.cwd(), options.basePath)
    : process.cwd()

  const foundFiles = extensions.reduce((found, ext) => {
    const searchPath = path.join(basePath, `${filename}.${ext}`)
    const exists = fs.existsSync(searchPath) && fs.statSync(searchPath).isFile()

    if (exists) found.push(searchPath)
    return found
  }, [])

  if (foundFiles.length === 0) return null

  if (foundFiles.length > 1) {
    throw new Error(
      `More than one files named ${filename} found at ${basePath}.`,
    )
  }

  return foundFiles[0]
}

// returns component
const readConfigurationFile = async (
  filename: string,
  options: FindConfigurationFileOptions = {},
): Promise<any> => {
  const filePath = findConfigurationFile(filename, options)
  if (!filePath) return null
  return await import(filePath)
}

const writeFileToTemp = async (
  readStream: ReadStream | string,
  filePath: string,
): Promise<void> => {
  const outputPath = path.join(tempFolderPath, filePath)
  await fs.ensureFile(outputPath)

  const isString = typeof readStream === 'string'
  const isBase64 =
    isString && readStream.match(/[^:]\w+\/[\w\-+.]+(?=;base64,)/)

  let dataBuffer: Buffer

  if (isBase64) {
    dataBuffer = Buffer.from(
      readStream.replace(/^data:.*;base64,/, ''),
      'base64',
    )
  } else if (isString) {
    dataBuffer = Buffer.from(readStream, 'utf8')
  } else {
    dataBuffer = await buffer(readStream)
  }

  await fs.outputFile(outputPath, dataBuffer)
}

const deleteFileFromTemp = async (filePath: string): Promise<void> => {
  const deletePath = path.join(tempFolderPath, filePath)
  await fs.remove(deletePath)
}

const emptyTemp = async (): Promise<void> => {
  await fs.emptyDir(tempFolderPath)
}

const ensureTempFolderExists = async (): Promise<void> => {
  await fs.ensureDir(tempFolderPath)
}

export {
  findConfigurationFile,
  readConfigurationFile,
  deleteFileFromTemp,
  emptyTemp,
  writeFileToTemp,
  ensureTempFolderExists,
  tempFolderPath,
}

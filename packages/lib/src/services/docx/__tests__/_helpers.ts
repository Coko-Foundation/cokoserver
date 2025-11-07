import path from 'path'

const getTestFilePath = (filename: string): string =>
  path.join(__dirname, '..', '..', '..', 'tmp', filename)

export default {
  getTestFilePath,
}

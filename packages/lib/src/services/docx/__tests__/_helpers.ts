import path from 'path'

const getTestFilePath = filename =>
  path.join(__dirname, '..', '..', '..', 'tmp', filename)

export default {
  getTestFilePath,
}

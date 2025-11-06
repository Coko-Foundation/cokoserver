import fs from 'fs'
import path from 'path'
import model from './file.model'

export default {
  model,
  modelName: 'File',
  typeDefs: fs.readFileSync(path.join(__dirname, 'file.graphql'), 'utf-8'),
}

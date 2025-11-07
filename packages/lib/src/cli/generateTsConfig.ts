import path from 'path'
import fs from 'fs-extra'

const base = require('./tsConfig.json')

function generateTsConfig(buildPath: string): string {
  const modified = { ...base }

  // const existingAbsolutePaths = modified.include.map(p => {
  //   return path.join(__dirname, p)
  // })

  const buildAbsolutePath = path.resolve(buildPath)

  // modified.include = [...existingAbsolutePaths, buildAbsolutePath]
  modified.include = [buildAbsolutePath]

  // modified.exclude = modified.exclude.map(p => {
  //   return path.join(__dirname, p)
  // })

  const filename = 'generatedTsConfig.json'
  const filePath = path.join(process.cwd(), filename)
  fs.writeFileSync(filename, JSON.stringify(modified, null, 2))
  return filePath
}

export default generateTsConfig

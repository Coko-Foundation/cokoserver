import path from 'path'
import fs from 'fs-extra'

const base = require('./tsConfig.json')

function generateTsConfig(
  buildPath: string,
  skipIfExists: boolean = false,
): string {
  const modified = { ...base }
  const buildAbsolutePath = path.resolve(buildPath)
  modified.include = [buildAbsolutePath]

  const filename = 'generatedTsConfig.json'
  const filePath = path.join(process.cwd(), filename)

  if (skipIfExists && fs.existsSync(filePath)) return filePath

  fs.writeFileSync(filename, JSON.stringify(modified, null, 2))
  return filePath
}

export default generateTsConfig

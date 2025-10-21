import path from 'path'
import fs from 'fs-extra'

const { default: base } = await import('./tsConfig.json', {
  with: { type: 'json' },
})

export default function generateTsConfig(buildPath) {
  const modified = { ...base }

  const existingAbsolutePaths = modified.include.map(p => {
    return path.join(import.meta.dirname, p)
  })

  const buildAbsolutePath = path.join(process.cwd(), buildPath)

  modified.include = [...existingAbsolutePaths, buildAbsolutePath]

  modified.exclude = modified.exclude.map(p => {
    return path.join(import.meta.dirname, p)
  })

  const filename = 'generatedTsConfig.json'
  const filePath = path.join(process.cwd(), filename)
  fs.writeFileSync(filename, JSON.stringify(modified, null, 2))
  return filePath
}

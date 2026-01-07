import path from 'path'

import { CompilerOptions } from 'typescript'

interface TSConfig {
  compilerOptions: CompilerOptions
  include: string[]
}

const base = require('./tsConfig.json')

function generateTsConfig(): TSConfig {
  const modified = { ...base }
  const buildAbsolutePath = path.resolve(`${process.cwd()}/**/*`)
  modified.include = [buildAbsolutePath]
  return modified
}

export default generateTsConfig

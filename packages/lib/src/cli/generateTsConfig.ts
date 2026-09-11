import path from 'path'

import { CompilerOptions } from 'typescript'

interface TSConfig {
  compilerOptions: CompilerOptions
  include: string[]
  exclude: string[]
}

const base = require('./tsConfig.json')

function generateTsConfig(exclude: string[] = []): TSConfig {
  const modified = { ...base }
  const buildAbsolutePath = path.resolve(`${process.cwd()}/**/*`)
  modified.include = [buildAbsolutePath]
  modified.exclude = [
    ...(base.exclude ?? []),
    ...exclude.map(e => path.resolve(process.cwd(), e)),
  ]
  modified.compilerOptions = {
    ...modified.compilerOptions,
    rootDir: process.cwd(),
  }
  return modified
}

export default generateTsConfig

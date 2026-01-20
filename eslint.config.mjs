import { defineEslintConfig, serverEslintConfig } from '@coko/lint'

// const allFilesConfig = serverEslintConfig.find(item => {
//   return item.files && item.files[0] === '**/*.{js,mjs,ts}'
// })

// allFilesConfig.settings['import/resolver'].typescript.project =
//   './packages/lib/src/tsconfig.json'

// const tsFileConfig = serverEslintConfig.find(item => {
//   return item.files && item.files[0] === '**/*.ts'
// })

const config = defineEslintConfig(serverEslintConfig)

export default config

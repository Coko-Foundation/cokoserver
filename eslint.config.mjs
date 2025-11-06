import {
  defineEslintConfig,
  serverEslintConfig,
} from '@coko/lint/src/eslint.mjs'

// import vitest from '@vitest/eslint-plugin'

// const allFilesConfig = serverEslintConfig.find(item => {
//   return item.files && item.files[0] === '**/*.{js,mjs,ts}'
// })

// allFilesConfig.settings['import/resolver'].exports = {
//   // Accepts the same options as the `resolve.exports` package
//   // See: https://github.com/lukeed/resolve.exports#optionsunsafe
//   // All optional, default values are shown
//   // Add "require" field to the conditions
//   // require: false,
//   // Add "browser" field to the conditions
//   // browser: false,
//   // List of additional/custom conditions
//   // conditions: [],
//   // Ignore everything except the `conditions` option
//   // unsafe: false,
// }

// allFilesConfig.settings['import/resolver'].typescript.project =
//   './packages/lib/src/tsconfig.json'

// allFilesConfig.settings['import/resolver'].node = {
//   extensions: ['.js', '.ts', '.mjs'],
// }

// allFilesConfig.settings['import/core-modules'] = ['graphql-upload']
// allFilesConfig.settings['import/ignore'] = ['graphql-upload/.*\\.mjs$']

// const tsFileConfig = serverEslintConfig.find(item => {
//   return item.files && item.files[0] === '**/*.ts'
// })

// tsFileConfig.rules = {
//   ...tsFileConfig.rules,
//   'no-redeclare': 'off',
//   '@typescript-eslint/no-redeclare': 'error',
//   'no-unused-vars': 'off',
//   '@typescript-eslint/no-unused-vars': 'error',
// }

// serverEslintConfig.push({
//   files: ['**/__tests__/**/*.test.ts'],
//   plugins: {
//     vitest,
//   },
//   languageOptions: {
//     globals: {
//       ...vitest.environments.env.globals,
//     },
//   },
//   settings: {
//     vitest: {
//       typecheck: true,
//     },
//   },
//   rules: {
//     ...vitest.configs.recommended.rules,
//   },
// })

// console.log(serverEslintConfig)

const config = defineEslintConfig(serverEslintConfig)

export default config

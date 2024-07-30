const { commitizen } = require('@coko/lint')

const modified = {
  ...commitizen,
  skipQuestions: ['body', 'footer'], // do NOT skip 'breaking'
  scopes: ['cli', 'db', 'fileStorage', 'job manager', 'models', 'server', '*'],
  askForBreakingChangeFirst: true,
}

module.exports = modified

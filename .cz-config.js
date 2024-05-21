const { commitizen } = require('@coko/lint')

const modified = {
  ...commitizen,
  skipQuestions: ['body', 'footer'], // do NOT skip 'breaking'
  scopes: ['server', 'middleware', 'models', 'db manager', 'cli', '*'],
  askForBreakingChangeFirst: true,
}

module.exports = modified

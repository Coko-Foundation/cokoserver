const { commitizen } = require('@coko/lint')

const modified = {
  ...commitizen,
  skipQuestions: ['body', 'footer'], // do NOT skip 'breaking'
  scopes: [
    'cli',
    'db manager',
    'fileStorage',
    'middleware',
    'models',
    'server',
    '*',
  ],
  askForBreakingChangeFirst: true,
}

module.exports = modified

const { commitizen } = require('@coko/lint')

const modified = {
  ...commitizen,
  skipQuestions: ['body', 'footer'], // do NOT skip 'breaking'
  scopes: [
    'cli',
    'db',
    'docs',
    'fileStorage',
    'graphql',
    'job manager',
    'models',
    'server',
    '*',
  ],
  askForBreakingChangeFirst: true,
}

module.exports = modified

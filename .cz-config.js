const { commitizen } = require('@coko/lint')

commitizen.skipQuestions = ['body', 'footer'] // do NOT skip 'breaking'
commitizen.scopes = ['server', 'middleware', 'models', 'db manager', 'cli', '*']

module.exports = commitizen

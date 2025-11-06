import commitizen from '@coko/lint/src/commitizen'

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

export default modified

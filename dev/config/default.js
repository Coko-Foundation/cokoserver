const permissions = require('./permissions')
const jobHandler = require('../scripts/jobHandler')

module.exports = {
  components: [
    './src/models/__tests__/helpers/fake',
    './src/models/activityLog',
    './src/models/chatMessage',
    './src/models/chatChannel',
    './src/models/file',
    './src/models/identity',
    './src/models/serviceCredential',
    './src/models/team',
    './src/models/teamMember',
    './src/models/user',
  ],
  teams: {
    global: [
      {
        displayName: 'Admin',
        role: 'admin',
      },
      {
        displayName: 'Editor',
        role: 'editor',
      },
      {
        displayName: 'Author',
        role: 'author',
      },
    ],
    nonGlobal: [
      {
        displayName: 'Editor',
        role: 'editor',
      },
      {
        displayName: 'Author',
        role: 'author',
      },
      {
        displayName: 'Reviewer',
        role: 'reviewer',
      },
    ],
  },
  useFileStorage: true,
  staticFolders: [
    {
      folderPath: './dev/static',
      mountPoint: '/',
    },
  ],
  integrations: {
    test: {
      clientId: 'ketida-editor',
      redirectUri:
        'http://localhost:4000/provider-connection-popup/lulu?next=/',
      tokenUrl:
        'https://api.sandbox.lulu.com/auth/realms/glasstree/protocol/openid-connect/token',
    },
  },
  permissions,
  onStartup: [
    // {
    //   label: 'do it 1',
    //   execute: async () => {
    //     console.log('this is 1')
    //     const wait = require('../../src/utils/wait')
    //     await wait(5000)
    //     console.log('script is finished')
    //   },
    // },
    // {
    //   label: 'do it 2',
    //   execute: () => {
    //     console.log('this is 2')
    //     // throw new Error('nooooooo')
    //   },
    // },
    // {
    //   label: 'do it 3',
    //   execute: () => {
    //     console.log('this is 3 starting')
    //     return new Promise(resolve => {
    //       setTimeout(() => {
    //         console.log('this 3 ending')
    //         resolve()
    //       }, 2000)
    //     })
    //   },
    // },
    // {
    //   label: 'do it 4',
    //   execute: () => {
    //     console.log('this is 4 starting')
    //     return new Promise(resolve => {
    //       setTimeout(() => {
    //         console.log('this 4 ending')
    //         resolve()
    //       }, 2000)
    //     })
    //   },
    // },
  ],
  // onShutdown: [
  //   {
  //     label: 'shutdown test',
  //     execute: () => {
  //       return new Promise(resolve => {
  //         console.log('Cleaning up...')
  //         setTimeout(() => {
  //           console.log('Cleanup done.')
  //           resolve()
  //         }, 2000)
  //       })
  //     },
  //   },
  // ],
  jobQueues: [
    {
      name: 'test',
      handler: jobHandler,
      teamSize: 1,
      teamConcurrency: 1,
      // schedule: '*/1 * * * *',
      // scheduleTimezone: 'Europe/Athens',
    },
    // {
    //   name: 'test1',
    //   handler: () => {
    //     // console.log('hello testz 2')
    //   },
    //   teamSize: 1,
    //   teamConcurrency: 1,
    // },
  ],
  devServerIgnore: ['./dev/ignoreMe/*'],
  random: true,
  // dbConnectionReporter: {
  //   interval: 2000,
  // },

  // emailVerificationTokenExpiry: {
  //   amount: 24,
  //   unit: 'minutes',
  // },

  // passwordResetTokenExpiry: {
  //   amount: '2',
  //   unit: 'minutes',
  // },
}

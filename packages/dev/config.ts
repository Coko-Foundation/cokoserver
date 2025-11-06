import jobHandler from './scripts/jobHandler'
import permissions from './permissions'

export default {
  components: [
    '@coko/server/src/models/__tests__/helpers/fake',
    '@coko/server/src/models/activityLog',
    '@coko/server/src/models/chatMessage',
    '@coko/server/src/models/chatChannel',
    '@coko/server/src/models/file',
    '@coko/server/src/models/identity',
    '@coko/server/src/models/serviceCredential',
    '@coko/server/src/models/team',
    '@coko/server/src/models/teamMember',
    '@coko/server/src/models/user',
  ],
  teams: {
    global: [
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
  staticFolders: [
    {
      folderPath: './dev/static',
      mountPoint: '/',
    },
  ],
  mailer: false,
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
  // random: true,

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
}

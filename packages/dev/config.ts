export default {
  components: [
    '@coko/server/dist/models/activityLog',
    '@coko/server/dist/models/chatMessage',
    '@coko/server/dist/models/chatChannel',
    '@coko/server/dist/models/file',
    '@coko/server/dist/models/identity',
    '@coko/server/dist/models/serviceCredential',
    '@coko/server/dist/models/team',
    '@coko/server/dist/models/teamMember',
    '@coko/server/dist/models/user',
    './models/myModel',
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
  integrations: [
    {
      name: 'test',
      clientId: 'ketida-editor',
      redirectUri:
        'http://localhost:4000/provider-connection-popup/lulu?next=/',
      tokenUrl:
        'https://api.sandbox.lulu.com/auth/realms/glasstree/protocol/openid-connect/token',
    },
  ],
  mailer: false,
  sentry: false,
  random: false,
  // adminUser: false,
}

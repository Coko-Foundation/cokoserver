const components = require('./components')

module.exports = {
  components,
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
  host: 'localhost',
  useFileStorage: true,
  staticFolders: [
    {
      folderPath: './dev/static',
      mountPoint: '/',
    },
  ],
  fileStorage: {
    accessKeyId: 'cokoServerUser',
    secretAccessKey: 'superSecretUserPassword',
    bucket: 'uploads',
    protocol: 'http',
    host: 'localhost',
    port: '9000',
    minioConsolePort: '9001',
    s3SeparateDeleteOperations: false,
  },
  integrations: {
    dummy: {
      clientId: 'ketida-editor',
      redirectUri:
        'http://localhost:4000/provider-connection-popup/lulu?next=/',
      tokenUrl:
        'https://api.sandbox.lulu.com/auth/realms/glasstree/protocol/openid-connect/token',
    },
  },
  mailer: {
    from: '',
  },
  // onStartup: [
  //   {
  //     label: 'do it 1',
  //     execute: () => {
  //       console.log('this is 1')
  //     },
  //   },
  //   {
  //     label: 'do it 2',
  //     execute: () => {
  //       console.log('this is 2')
  //       // throw new Error('nooooooo')
  //     },
  //   },
  //   {
  //     label: 'do it 3',
  //     execute: () => {
  //       console.log('this is 3 starting')
  //       return new Promise(resolve => {
  //         setTimeout(() => {
  //           console.log('this 3 ending')
  //           resolve()
  //         }, 2000)
  //       })
  //     },
  //   },
  //   {
  //     label: 'do it 4',
  //     execute: () => {
  //       console.log('this is 4 starting')
  //       return new Promise(resolve => {
  //         setTimeout(() => {
  //           console.log('this 4 ending')
  //           resolve()
  //         }, 2000)
  //       })
  //     },
  //   },
  // ],
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
}

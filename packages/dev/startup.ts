import typescriptTest from './testme'

export default [
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
  {
    label: 'Test typescript',
    execute: (): void => {
      typescriptTest('Yannis')
    },
  },
  // {
  //   label: 'Make a config object',
  //   execute: async () => {
  //     const { default: Config } = await import(
  //       '../../src/configManager/Config'
  //     )
  //     const x = new Config()
  //     await x.init()
  //   },
  // },
]

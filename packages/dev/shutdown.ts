/* eslint-disable no-console */

export default [
  {
    label: 'shutdown test',
    execute: (): Promise<void> => {
      return new Promise(resolve => {
        console.log('Cleaning up...')
        setTimeout(() => {
          console.log('Cleanup done.')
          resolve()
        }, 2000)
      })
    },
  },
]

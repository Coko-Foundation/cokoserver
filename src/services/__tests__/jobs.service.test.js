/* eslint-disable jest/no-disabled-tests, jest/no-commented-out-tests */

// const { boss } = require('../../jobs')
// const { defer: deferJob } = require('../jobs')

// // Mock boss.<publish, subscribe>
// jest.mock('../../jobs', () => {
//   const originalModule = jest.requireActual('../../jobs')
//   return {
//     __esModule: true,
//     ...originalModule,
//     boss: {
//       reset() {
//         this.subscriptions = {}
//         this.log = []
//         this.lastValue = undefined
//         this.lastJob = undefined
//       },
//       async publish(name, data, options) {
//         this.log.push(`publish ${name}`)
//         this.lastJob = dummyJob(data, options)
//       },
//       async subscribe(name, options, callback) {
//         this.subscriptions[name] = { options, callback }
//       },
//     },
//   }
// })

// const dummyJob = (data, options) => ({ data, options })

// describe.skip('jobs service', () => {
//   beforeEach(async () => {
//     // Reset the mock boss object
//     boss.reset()
//     /* eslint-disable-next-line global-require */
//     const { subscribeJobsToQueue } = require('../../jobs')
//     subscribeJobsToQueue([
//       {
//         name: 'dummy-1',
//         callback: async job => {
//           boss.lastValue = `dummy1: ${job.data.value}`
//         },
//         subscribeOptions: { fakeOptions: 'subscribe' },
//       },
//       {
//         name: 'dummy-2',
//         callback: job => {
//           boss.lastValue = `dummy2: ${job.data.arg1} ${job.data.arg2}`
//         },
//       },
//     ])
//   })

//   it('registers jobs', async () => {
//     expect(Object.keys(boss.subscriptions)).toEqual(['dummy-1', 'dummy-2'])
//     expect(boss.lastValue).toBeUndefined()
//     expect(boss.lastJob).toBeUndefined()
//     expect(typeof boss.subscriptions['dummy-1'].callback).toEqual('function')
//     expect(typeof boss.subscriptions['dummy-2'].callback).toEqual('function')
//   })

//   it('defers jobs by seconds', async () => {
//     boss.log = []
//     await deferJob(
//       'dummy-1',
//       { seconds: 15 },
//       { value: 'some value' },
//       { fakeOptions: 'publish' },
//     )
//     expect(boss.log).toEqual(['publish dummy-1'])
//     expect(boss.lastJob.data).toEqual({ value: 'some value' })
//     expect(Object.keys(boss.lastJob.options).length).toEqual(2)
//     expect(boss.lastJob.options.startAfter).toEqual(15)
//     expect(boss.lastJob.options.fakeOptions).toEqual('publish')
//     boss.log = []
//     await deferJob('dummy-2', { seconds: 5 }, { arg1: 1, arg2: 2 })
//     expect(boss.log).toEqual(['publish dummy-2'])
//     expect(boss.lastJob.data).toEqual({ arg1: 1, arg2: 2 })
//     expect(Object.keys(boss.lastJob.options).length).toEqual(1)
//     expect(boss.lastJob.options.startAfter).toEqual(5)
//   })

//   it('defers jobs by any of days, hours, minutes and/or seconds', async () => {
//     boss.log = []
//     await deferJob(
//       'dummy-2',
//       { days: 1, hours: 1, minutes: 1, seconds: 5 },
//       { arg1: 2, arg2: 1 },
//     )
//     expect(boss.log).toEqual(['publish dummy-2'])
//     expect(boss.lastJob.data).toEqual({ arg1: 2, arg2: 1 })
//     expect(boss.lastJob.options.startAfter).toEqual(90065)
//     boss.log = []
//     await deferJob('dummy-2', { days: 1 }, { arg1: 2, arg2: 1 })
//     expect(boss.log).toEqual(['publish dummy-2'])
//     expect(boss.lastJob.data).toEqual({ arg1: 2, arg2: 1 })
//     expect(boss.lastJob.options.startAfter).toEqual(86400)
//     boss.log = []
//     await deferJob('dummy-2', { hours: 1 }, { arg1: 2, arg2: 1 })
//     expect(boss.log).toEqual(['publish dummy-2'])
//     expect(boss.lastJob.data).toEqual({ arg1: 2, arg2: 1 })
//     expect(boss.lastJob.options.startAfter).toEqual(3600)
//     boss.log = []
//     await deferJob('dummy-2', { minutes: 1 }, { arg1: 2, arg2: 1 })
//     expect(boss.log).toEqual(['publish dummy-2'])
//     expect(boss.lastJob.data).toEqual({ arg1: 2, arg2: 1 })
//     expect(boss.lastJob.options.startAfter).toEqual(60)
//     boss.log = []
//     await deferJob('dummy-2', { seconds: 1 }, { arg1: 2, arg2: 1 })
//     expect(boss.log).toEqual(['publish dummy-2'])
//     expect(boss.lastJob.data).toEqual({ arg1: 2, arg2: 1 })
//     expect(boss.lastJob.options.startAfter).toEqual(1)
//   })

//   it('rejects invalid offsets', async () => {
//     let wrapperFn = async () => deferJob('dummy-1', { years: 1, days: 1 })
//     await expect(wrapperFn).rejects.toThrow(
//       new Error('Invalid keys: ["years"]'),
//     )
//     wrapperFn = async () => deferJob('dummy-2', { days: 1, minutes: 'three' })
//     await expect(wrapperFn).rejects.toThrow(
//       new Error('Invalid values: [1,0,"three",0]'),
//     )
//   })
// })

/* eslint-disable jest/no-disabled-tests, jest/no-commented-out-tests */

// const { boss, subscribeJobsToQueue } = require('../jobs')
// const { jobs } = require('../services')
// const db = require('../dbManager/db')
// // const { renewAuthTokens } = require('../utils/tokens')

// const freezeTime = 1701856542000
// const daySeconds = 24 * 3600

// // Mock boss.<publish, subscribe>
// jest.mock('../jobs', () => {
//   const originalModule = jest.requireActual('../jobs')
//   return {
//     __esModule: true,
//     ...originalModule,
//     boss: {
//       reset() {
//         this.subscriptions = {}
//         this.log = []
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

// // Mock Identity.findOne
// jest.mock('../models', () => {
//   const originalModule = jest.requireActual('../models')
//   return {
//     __esModule: true,
//     ...originalModule,
//     Identity: {
//       // Fake an identity which expires in 7 days time
//       findOne: async data => ({
//         oauthRefreshTokenExpiration: new Date(
//           freezeTime + daySeconds * 7 * 1000,
//         ),
//       }),
//     },
//   }
// })

// // Mock renewAuthTokens - don't send any api requests etc
// jest.mock('../utils/tokens', () => {
//   const originalModule = jest.requireActual('../utils/tokens')
//   return {
//     __esModule: true,
//     ...originalModule,
//     renewAuthTokens: jest.fn(async (userId, providerLabel) => {}),
//   }
// })

// jest.mock('../models/user/user.controller', () => {
//   const originalModule = jest.requireActual('../models/user/user.controller')
//   return {
//     __esModule: true,
//     ...originalModule,
//     getUser: jest.fn(async userId => ({
//       id: userId,
//     })),
//   }
// })
// // Mock the date and time
// Date.now = jest.fn(() => freezeTime)

// const dummyJob = (data, options) => ({
//   data,
//   options,
//   isDone: false,
//   done() {
//     this.isDone = true
//   },
// })

// describe.skip('jobs service', () => {
//   beforeEach(async () => {
//     // Reset the mock boss object
//     boss.reset()
//     await subscribeJobsToQueue()
//   })

//   afterAll(() => {
//     db.destroy()
//   })

//   it('registers jobs', async () => {
//     expect(Object.keys(boss.subscriptions)).toEqual([
//       jobs.REFRESH_TOKEN_EXPIRED,
//     ])
//     expect(
//       typeof boss.subscriptions[jobs.REFRESH_TOKEN_EXPIRED].callback,
//     ).toEqual('function')
//   })
// })

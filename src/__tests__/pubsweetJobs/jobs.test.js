/* eslint-disable jest/no-disabled-tests, jest/no-commented-out-tests, jest/no-done-callback */

// const { startJobQueue } = require('../../jobs')
// const db = require('../../dbManager/db')

// const someHandler = async job => {
//   expect(job.data.param).toEqual('aThing')
//   return Promise.resolve({ thing: 'someOtherThing' })
// }

// describe.skip('jobs', () => {
//   let jobQueue

//   beforeAll(async () => {
//     jobQueue = await startJobQueue()
//   })

//   afterAll(() => {
//     db.destroy()
//   })

//   it('submits a job, runs it, and notifies on completion', async done => {
//     const queueName = 'aJobQueue'

//     // Subscribe to the job queue with an async handler
//     await jobQueue.subscribe(queueName, someHandler)

//     // Add a job to the queue
//     await jobQueue.publish(queueName, { param: 'aThing' })

//     // Be notified on job completion with job result
//     await jobQueue.onComplete(queueName, job => {
//       try {
//         expect(job.data.response).toEqual({ thing: 'someOtherThing' })
//         done()
//       } catch (e) {
//         done.fail(e)
//       }
//     })
//   })

//   afterAll(async () => jobQueue.stop())
// })

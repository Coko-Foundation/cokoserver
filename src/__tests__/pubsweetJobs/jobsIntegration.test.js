/* eslint-disable jest/no-disabled-tests, jest/no-done-callback */

const startServer = require('../../startServer')
const db = require('../../dbManager/db')
const { connectToJobQueue } = require('../../jobs')

const someHandler = async job => {
  expect(job.data.param).toEqual('theThing')
  return Promise.resolve({ thing: 'theOtherThing' })
}

describe.skip('integrated job queue', () => {
  let server

  beforeAll(async () => {
    server = await startServer()
  })

  afterAll(() => {
    db.destroy()
  })

  // This is to verify that pg-boss has been setup with pg-boss.start()
  // in the process of starting coko server
  it('ready to connect and process jobs when server starts', async done => {
    const queueName = 'aJobQueue3'

    const jobQueue = await connectToJobQueue()

    // Add job to the queue
    await jobQueue.publish(queueName, { param: 'theThing' })

    // Subscribe to the job queue with an async handler
    await jobQueue.subscribe(queueName, someHandler)

    // Be notified on job completion with job result
    await jobQueue.onComplete(queueName, job => {
      try {
        expect(job.data.response).toEqual({ thing: 'theOtherThing' })
        // jobQueue.disconnect().then(() => done())
        jobQueue.stop().then(() => done())
      } catch (e) {
        done.fail(e)
      }
    })
  })

  afterAll(done => server.close(done))
})

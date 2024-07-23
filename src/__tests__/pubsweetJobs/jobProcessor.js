// const someHandler = async job => Promise.resolve({ thing: 'someOtherThing' })

// const handleJobs = async () => {
//   /* eslint-disable-next-line no-underscore-dangle */
//   global.__testDbName = process.env.__TESTDBNAME
//   /* eslint-disable-next-line global-require */
//   const { connectToJobQueue } = require('../../jobs')

//   const jobQueue = await connectToJobQueue()

//   const queueName = 'aJobQueue2'

//   // Subscribe to the job queue with an async handler
//   await jobQueue.subscribe(queueName, someHandler)
// }

// handleJobs()

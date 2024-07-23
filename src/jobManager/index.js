const config = require('config')

const { boss, start, stop } = require('./boss')
const JobManager = require('./JobManager')
const { defaultJobQueueNames } = require('./defaultJobQueues')

const jobManager = new JobManager(boss)

const startJobManager = async () => start(config)

module.exports = {
  // used internally, and also exported outside of coko server
  jobManager,

  // only used internally
  defaultJobQueueNames,

  // used by startServer
  startJobManager,
  stopJobManager: stop,
}

const config = require('config')

const { start, stop } = require('./boss')
const { jobManager } = require('./JobManager')
const defaultJobQueueNames = require('./defaultJobQueueNames')

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

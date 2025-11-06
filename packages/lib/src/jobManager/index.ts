// @ts-nocheck

import config from '../configManager/config'
import { start, stop } from './boss'
import { jobManager } from './JobManager'
import defaultJobQueueNames from './defaultJobQueueNames'

const startJobManager = async () => start(config)
const stopJobManager = stop

export {
  // used internally, and also exported outside of coko server
  jobManager,

  // only used internally
  defaultJobQueueNames,

  // used by startServer
  startJobManager,
  stopJobManager,
}

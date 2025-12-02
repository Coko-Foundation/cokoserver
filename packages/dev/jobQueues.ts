/* eslint-disable no-console */

import { config } from '@coko/server'
import { JobHandlerArguments } from '@coko/server/src/jobManager/JobManager'

export default [
  {
    name: 'test',
    handler: (job: JobHandlerArguments): void => {
      console.log(job)

      // check that you can read config without circular dependencies
      const port = config.get('db.port')
      console.log('db port', port)
    },
    teamSize: 1,
    teamConcurrency: 1,
    // schedule: '*/1 * * * *',
    // scheduleTimezone: 'Europe/Athens',
  },
]

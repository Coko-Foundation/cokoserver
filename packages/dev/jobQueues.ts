/* eslint-disable no-console */

import { config } from '@coko/server'
import { JobHandlerArguments } from '@coko/server/src/jobManager/JobManager'

export default [
  {
    name: 'test',
    handler: (job: JobHandlerArguments): void => {
      console.log(job)
      const random = config.get('random')
      console.log('is random', random)
    },
    teamSize: 1,
    teamConcurrency: 1,
    schedule: '*/1 * * * *',
    scheduleTimezone: 'Europe/Athens',
  },
]

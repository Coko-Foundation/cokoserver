import { Transaction } from 'objection'

import logger from '../logger'
import useTransaction from '../models/useTransaction'
import ActivityLog from '../models/activityLog/activityLog.model'
import { labels } from '../models/activityLog/constants'

const { ACTIVITY_LOG_SERVICE } = labels

type ActivityLogOptions = {
  trx?: Transaction
}

const activityLog = async (
  data,
  options: ActivityLogOptions = {},
): Promise<ActivityLog> => {
  try {
    const { trx } = options

    return useTransaction(
      async tr => {
        return ActivityLog.insert(data, { trx: tr })
      },
      {
        trx,
        passedTrxOnly: true,
      },
    )
  } catch (e) {
    logger.error(`${ACTIVITY_LOG_SERVICE} activityLog: ${e.message}`)
    throw new Error(e)
  }
}

export default activityLog

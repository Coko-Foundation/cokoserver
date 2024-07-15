const PgBoss = require('pg-boss')
const moment = require('moment')

const logger = require('./logger')
const { logTask, logTaskItem } = require('./logger/internals')
const db = require('./dbManager/db')
const subscriptionManager = require('./graphql/pubsub')
const { REFRESH_TOKEN_EXPIRED } = require('./services/jobs/jobs.identifiers')

const {
  subscriptions: { USER_UPDATED },
} = require('./models/user/constants')

const { getUser } = require('./models/user/user.controller')
const Identity = require('./models/identity/identity.model')

const dbAdapter = {
  executeSql: (sql, parameters = []) => {
    try {
      // This is needed to replace pg-boss' $1, $2 arguments
      // into knex's :val, :val2 style.
      const replacedSql = sql.replace(/\$(\d+)\b/g, (_, number) => `:${number}`)

      const parametersObject = {}
      parameters.forEach(
        (value, index) => (parametersObject[`${index + 1}`] = value),
      )

      return db.raw(replacedSql, parametersObject)
    } catch (err) {
      return logger.error('Error querying database:', err.message)
    }
  },
}

const boss = new PgBoss({ db: dbAdapter })

boss.on('error', async error => {
  logger.error(error)

  // We've had processes remain open in testing,
  // because job queues kept polling the database,
  // while the database no longer existed.
  if (
    process.env.NODE_ENV === 'test' &&
    error.message.match(/database.*does not exist/)
  ) {
    if (started) {
      started = false
      await boss.stop()
    }
    // if (connected) {
    //   connected = false
    //   await boss.disconnect()
    // }
  }
})

// 'Start' is for queue maintainers (i.e. coko server)
let started = false
// 'Connect' is for queue observers (e.g. a job worker)
// let connected = false

const start = async () => {
  if (started) return boss

  await boss.start()
  started = true
  // connected = true
  return boss
}

/**
 * Add a list of jobs to the job queue. If no jobs are specified, subscribe all
 * preconfigured jobs to the queue.
 */
const subscribeJobsToQueue = async jobsList => {
  logTask('Subscribing job callbacks to the job queue')
  const jobsToSubscribe = jobsList || defaultJobs
  const existingSubscriptions = boss.manager?.subscriptions || {}

  await Promise.all(
    jobsToSubscribe.map(async ({ name, callback, subscribeOptions = {} }) => {
      try {
        if (!(name instanceof String || typeof name === 'string')) {
          throw new Error('Invalid name')
        }

        if (!(callback instanceof Function)) {
          throw new Error('Invalid callback')
        }

        if (!(subscribeOptions instanceof Object)) {
          throw new Error('Invalid subscribeOptions')
        }

        // Don't resubscribe - it creates unexpected behaviour
        if (existingSubscriptions[name] === undefined) {
          await boss.subscribe(name, subscribeOptions, callback)
          logTaskItem(`Subscribed '${name}'`)
        } else {
          throw new Error('Already subscribed')
        }
      } catch (e) {
        logger.error(`Job ${name}: subscribe error:`, e)
        throw e
      }
    }),
  )
}

// TODO - append jobs found in config

// Define default jobs
const defaultJobs = [
  // {
  //   name: jobs.RENEW_AUTH_TOKENS_JOB,
  //   callback: async job => {
  //     const bufferTime = 24 * 3600
  //     const { userId, providerLabel } = job.data

  //     try {
  //       await renewAuthTokens(userId, providerLabel)
  //       job.done()
  //     } catch (e) {
  //       logger.error(`Job ${jobs.RENEW_AUTH_TOKENS_JOB}: callback error:`, e)
  //       throw e
  //     }

  //     try {
  //       // Schedule auth renewal
  //       const { oauthRefreshTokenExpiration } = await Identity.findOne({
  //         userId,
  //         provider: providerLabel,
  //       })

  //       const expiresIn = (oauthRefreshTokenExpiration - moment().utc()) / 1000

  //       const renewAfter = expiresIn - bufferTime

  //       if (renewAfter < 0) {
  //         throw new Error('"renewAfter" is less than 0')
  //       }

  //       await jobs.defer(
  //         jobs.RENEW_AUTH_TOKENS_JOB,
  //         { seconds: renewAfter },
  //         { userId, providerLabel },
  //       )
  //     } catch (e) {
  //       logger.error(`Job ${jobs.RENEW_AUTH_TOKENS_JOB}: defer error:`, e)
  //       throw e
  //     }
  //   },
  // },
  {
    name: REFRESH_TOKEN_EXPIRED,
    callback: async job => {
      try {
        const { userId, providerLabel } = job.data

        const updatedUser = await getUser(userId)

        const providerUserIdentity = await Identity.findOne({
          userId,
          provider: providerLabel,
        })

        if (!providerUserIdentity) {
          throw new Error(
            `identity for user with id ${userId} does not exist for provider ${providerLabel}`,
          )
        }

        const { oauthRefreshTokenExpiration } = providerUserIdentity
        const UTCNowTimestamp = moment().utc().toDate().getTime()

        const refreshTokenExpired =
          oauthRefreshTokenExpiration.getTime() < UTCNowTimestamp

        if (refreshTokenExpired) {
          subscriptionManager.publish(USER_UPDATED, {
            userUpdated: updatedUser,
          })
        }

        job.done()
      } catch (e) {
        job.done(e)
        logger.error(`Job ${REFRESH_TOKEN_EXPIRED}: defer error:`, e)
        throw e
      }
    },
  },
]

module.exports = {
  boss,
  startJobQueue: start,
  stopJobQueue: async () => {
    await boss.stop()
    started = false
    // connected = false
  },
  connectToJobQueue: start,
  subscribeJobsToQueue,
}

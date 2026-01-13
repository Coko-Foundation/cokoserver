import { describe, beforeAll, afterEach, it, expect, vi } from 'vitest'

import wait from '../../utils/wait'
import { JobManager } from '../JobManager'
import defaultJobQueueNames from '../defaultJobQueueNames'
import { JobManagerOptionsError } from '../errors'
import { db } from '../../db'
import config from '../../configManager/config'

const N = 3000

/**
 * Note:
 *
 * By its nature the queue will have some waiting time involved, which will
 * make the tests less snappy. By default, polling for new jobs happens every
 * 2 seconds (hence the N waiitng time). Additionally, to test deferred jobs
 * we'll need to wait for the defer time to pass to see if it has been picked
 * up.
 */

describe('Job queues', () => {
  describe('Job manager', () => {
    const jobManager: JobManager = new JobManager({ exposeBossInstance: true })

    const jobQueues = [
      {
        name: 'test-me',
        handler: vi.fn(),
      },
    ]

    beforeAll(async () => {
      await config.init({ mailer: false })
      db.init()
      jobQueues[0].handler.mockClear()
      await jobManager.init(jobQueues)
    })

    afterEach(async () => {
      const queues = await jobManager.boss.getQueues()
      const queueNames = queues.map(q => q.name)

      await Promise.all(
        queueNames.map(async name => {
          await jobManager.boss.deleteAllJobs(name)
        }),
      )
    })

    it('sends a job to the queue', async () => {
      const name = jobQueues[0].name
      const spy = jobQueues[0].handler

      await jobManager.sendToQueue(name, { id: 1 })
      const stats = await jobManager.boss.getQueueStats(name)
      expect(stats.queuedCount).toBe(1)

      await wait(N)

      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { id: 1 },
        }),
      )

      const newStats = await jobManager.boss.getQueueStats(name)
      expect(newStats.queuedCount).toBe(0)
    })

    it('defers a job to run later', async () => {
      const name = jobQueues[0].name

      await jobManager.sendToQueue(name, { id: 1 }, { startAfter: 5 })

      // should still have one pending job after N seconds
      await wait(N)
      const stats = await jobManager.boss.getQueueStats(name)
      expect(stats.queuedCount).toBe(1)

      // it should have now been picked up by now
      await wait(4000)
      const newStats = await jobManager.boss.getQueueStats(name)
      expect(newStats.queuedCount).toBe(0)
    }, 10000)

    it('cannot accept invalid options when sending a job', async () => {
      const name = jobQueues[0].name

      // no options valid
      await jobManager.sendToQueue(name, { id: 0 })

      // empty options valid
      await jobManager.sendToQueue(name, { id: 1 }, {})

      // valid options
      await jobManager.sendToQueue(
        name,
        { id: 2 },
        {
          startAfter: 500,
        },
      )

      // valid options, invalid values
      await expect(
        jobManager.sendToQueue(
          name,
          { id: 3 },
          {
            startAfter: 0,
          },
        ),
      ).rejects.toThrow(JobManagerOptionsError)

      // valid options, invalid values
      await expect(
        jobManager.sendToQueue(
          name,
          { id: 4 },
          {
            startAfter: -1,
          },
        ),
      ).rejects.toThrow(JobManagerOptionsError)

      // valid options, invalid values
      await expect(
        jobManager.sendToQueue(
          name,
          { id: 5 },
          {
            // @ts-ignore
            startAfter: '3 seconds',
          },
        ),
      ).rejects.toThrow(JobManagerOptionsError)

      // invalid options
      await expect(
        jobManager.sendToQueue(
          name,
          { id: 6 },
          {
            // @ts-ignore
            custom: true,
          },
        ),
      ).rejects.toThrow(JobManagerOptionsError)
    })
  })

  describe('Boss', () => {
    beforeAll(async () => {
      await config.init({ mailer: false })
      db.init()
    })

    it('registers built-in queues when started', async () => {
      const jobManager = new JobManager({ exposeBossInstance: true })
      await jobManager.init()

      const refreshTokenQueue = await jobManager.boss.getQueue(
        defaultJobQueueNames.REFRESH_TOKEN_EXPIRED,
      )

      expect(refreshTokenQueue).toBeDefined()
    })

    it('registers custom queues when started', async () => {
      const jobManager = new JobManager({ exposeBossInstance: true })
      await jobManager.init([
        {
          name: 'test-me',
          handler: vi.fn(),
        },
      ])

      const stats = await jobManager.boss.getQueueStats('test-me')
      expect(stats.queuedCount).toBe(0)
    })

    it('registers schedules', async () => {
      const jobManager = new JobManager({ exposeBossInstance: true })

      await jobManager.init([
        {
          name: 'test-schedule',
          handler: vi.fn(),
          schedule: '0 1 * * *',
          scheduleTimezone: 'Europe/Athens',
        },
      ])

      const schedules = await jobManager.boss.getSchedules()

      expect(schedules).toHaveLength(1)
      expect(schedules[0].name).toBe('test-schedule')
      expect(schedules[0].cron).toBe('0 1 * * *')
      // @ts-ignore
      expect(schedules[0].timezone).toBe('Europe/Athens')

      await jobManager.boss.unschedule('test-schedule')
    })

    it('cleans up orphan schedules when the queue is removed', async () => {
      const jobManager = new JobManager({ exposeBossInstance: true })

      await jobManager.init([
        {
          name: 'test-schedule',
          handler: vi.fn(),
          schedule: '0 1 * * *',
          scheduleTimezone: 'Europe/Athens',
        },
      ])

      const schedules = await jobManager.boss.getSchedules()
      expect(schedules).toHaveLength(1)

      await jobManager.init([])

      const newSchedules = await jobManager.boss.getSchedules()
      expect(newSchedules).toHaveLength(0)
    })

    it('cleans up orphan schedules when the schedule is removed from the queue', async () => {
      const jobManager = new JobManager({ exposeBossInstance: true })

      await jobManager.init([
        {
          name: 'test-schedule',
          handler: vi.fn(),
          schedule: '0 1 * * *',
          scheduleTimezone: 'Europe/Athens',
        },
      ])

      const schedules = await jobManager.boss.getSchedules()
      expect(schedules).toHaveLength(1)

      await jobManager.init([
        {
          name: 'test-schedule',
          handler: vi.fn(),
        },
      ])

      const newSchedules = await jobManager.boss.getSchedules()
      expect(newSchedules).toHaveLength(0)
    })
  })
})

import { describe, beforeAll, afterEach, it, expect, vi } from 'vitest'

import wait from '../../utils/wait'
import { JobManager } from '../JobManager'
import defaultJobQueueNames from '../defaultJobQueueNames'
import { JobManagerOptionsError } from '../errors'

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
      jobQueues[0].handler.mockClear()
      await jobManager.init(jobQueues)
    })

    afterEach(async () => {
      await jobManager.boss.deleteAllQueues()
    })

    it('sends a job to the queue', async () => {
      const name = jobQueues[0].name
      const spy = jobQueues[0].handler

      await jobManager.sendToQueue(name, { id: 1 })

      const size = await jobManager.boss.getQueueSize(name)
      expect(size).toBe(1)

      await wait(N)

      expect(spy).toHaveBeenCalledTimes(1)

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { id: 1 },
        }),
      )

      const newSize = await jobManager.boss.getQueueSize(name)
      expect(newSize).toBe(0)
    })

    it('defers a job to run later', async () => {
      const name = jobQueues[0].name

      await jobManager.sendToQueue(name, { id: 1 }, { startAfter: 5 })

      // should still have one pending job after 2.5 seconds
      await wait(N)
      const size = await jobManager.boss.getQueueSize(name)
      expect(size).toBe(1)

      // it should have now been picked up by now
      await wait(4000)
      const newSize = await jobManager.boss.getQueueSize(name)
      expect(newSize).toBe(0)
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
    it('registers built-in queues when started', async () => {
      const jobManager = new JobManager({ exposeBossInstance: true })
      await jobManager.init()

      const refreshTokenQueueSize = await jobManager.boss.getQueueSize(
        defaultJobQueueNames.REFRESH_TOKEN_EXPIRED,
      )

      expect(refreshTokenQueueSize).toBe(0)
    })

    it('registers custom queues when started', async () => {
      const jobManager = new JobManager({ exposeBossInstance: true })
      await jobManager.init([
        {
          name: 'test-me',
          handler: vi.fn(),
        },
      ])

      const testQueueSize = await jobManager.boss.getQueueSize('test-me')
      expect(testQueueSize).toBe(0)
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

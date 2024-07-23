const wait = require('../../utils/wait')
const TestConfig = require('../../utils/TestConfig')

const { jobManager, defaultJobQueueNames } = require('..')
const { boss, start, stop } = require('../boss')
const JobManagerOptionsError = require('../JobManagerOptionsError')

const N = 2500

/**
 * Note:
 *
 * By its nature the queue will have some waiting time involved, which will
 * make the tests less snappy. By default, polling for new jobs happens every
 * 2 seconds (hence the N waiitng time). Additionally, to test deferred jobs
 * we'll need to wait for the defer time to pass to see if it has been picked
 * up.
 */

describe('Job manager', () => {
  const config = new TestConfig({
    jobQueues: [
      {
        name: 'test-me',
        handler: () => {},
      },
    ],
  })

  beforeAll(async () => {
    await start(config)
  })

  afterEach(async () => {
    await boss.deleteAllQueues()
  })

  afterAll(async () => {
    await stop()
  })

  it('sends a job to the queue', async () => {
    const name = 'test-me'
    const queues = config.get('jobQueues')
    const spy = jest.spyOn(queues[0], 'handler')

    await jobManager.sendToQueue(name, { id: 1 })

    const size = await boss.getQueueSize(name)
    expect(size).toBe(1)

    await wait(N)

    expect(spy).toHaveBeenCalledTimes(1)

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({
        data: { id: 1 },
      }),
      expect.objectContaining({ config: expect.any(Object) }),
    )

    const newSize = await boss.getQueueSize(name)
    expect(newSize).toBe(0)
  })

  it('defers a job to run later', async () => {
    const name = 'test-me'

    await jobManager.sendToQueue(name, { id: 1 }, { startAfter: 5 })

    // should still have one pending job after 2.5 seconds
    await wait(N)
    const size = await boss.getQueueSize(name)
    expect(size).toBe(1)

    // it should have now been picked up by now
    await wait(4000)
    const newSize = await boss.getQueueSize(name)
    expect(newSize).toBe(0)
  }, 7000)

  it('cannot accept invalid options when sending a job', async () => {
    const name = 'test-me'

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
          custom: true,
        },
      ),
    ).rejects.toThrow(JobManagerOptionsError)
  })
})

describe('Boss', () => {
  it('gets started and stopped', async () => {
    expect(boss.stopped).toBe(true)
    const config = new TestConfig({})
    await start(config)
    expect(boss.started).toBe(true)
    await stop()
    expect(boss.stopped).toBe(true)
  })

  it('registers built-in queues when started', async () => {
    const config = new TestConfig({})
    await start(config)

    const refreshTokenQueueSize = await boss.getQueueSize(
      defaultJobQueueNames.REFRESH_TOKEN_EXPIRED,
    )

    expect(refreshTokenQueueSize).toBe(0)

    await stop()
  })

  it('registers custom queues when started', async () => {
    const config = new TestConfig({
      jobQueues: [
        {
          name: 'test-me',
          handler: () => {},
        },
      ],
    })

    await start(config)

    const testQueueSize = await boss.getQueueSize('test-me')
    expect(testQueueSize).toBe(0)

    await stop()
  })

  it('registers schedules', async () => {
    const config = new TestConfig({
      jobQueues: [
        {
          name: 'test-schedule',
          handler: () => {},
          schedule: '0 1 * * *',
          scheduleTimezone: 'Europe/Athens',
        },
      ],
    })

    await start(config)

    const schedules = await boss.getSchedules()

    expect(schedules).toHaveLength(1)
    expect(schedules[0].name).toBe('test-schedule')
    expect(schedules[0].cron).toBe('0 1 * * *')
    expect(schedules[0].timezone).toBe('Europe/Athens')

    await boss.unschedule('test-schedule')
    await stop()
  })

  // cleans up orphan schedules

  it('cleans up orphan schedules when the queue is removed', async () => {
    const config = new TestConfig({
      jobQueues: [
        {
          name: 'test-schedule',
          handler: () => {},
          schedule: '0 1 * * *',
          scheduleTimezone: 'Europe/Athens',
        },
      ],
    })

    await start(config)

    const schedules = await boss.getSchedules()
    expect(schedules).toHaveLength(1)

    await stop()

    const newConfig = new TestConfig({
      jobQueues: [],
    })

    await start(newConfig)

    const newSchedules = await boss.getSchedules()
    expect(newSchedules).toHaveLength(0)
  })

  it('cleans up orphan schedules when the schedule is removed from the queue', async () => {
    const config = new TestConfig({
      jobQueues: [
        {
          name: 'test-schedule',
          handler: () => {},
          schedule: '0 1 * * *',
          scheduleTimezone: 'Europe/Athens',
        },
      ],
    })

    await start(config)

    const schedules = await boss.getSchedules()
    expect(schedules).toHaveLength(1)

    await stop()

    const newConfig = new TestConfig({
      jobQueues: [
        {
          name: 'test-schedule',
          handler: () => {},
        },
      ],
    })

    await start(newConfig)

    const newSchedules = await boss.getSchedules()
    expect(newSchedules).toHaveLength(0)
  })
})

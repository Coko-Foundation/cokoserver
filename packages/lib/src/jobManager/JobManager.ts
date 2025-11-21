import PgBoss from 'pg-boss'
import { z } from 'zod'

import { boss } from './boss'
import JobManagerOptionsError from './JobManagerOptionsError'

const sendOptionsSchema = z.strictObject({
  startAfter: z.number().int().positive().optional(),
})

type SendOptions = z.infer<typeof sendOptionsSchema>

class JobManager {
  #boss: PgBoss

  constructor(passedBoss) {
    this.#boss = passedBoss
  }

  async sendToQueue(
    queueName: string,
    data,
    options: SendOptions = {},
  ): Promise<void> {
    try {
      sendOptionsSchema.parse(options)
    } catch (error) {
      throw new JobManagerOptionsError(error.message)
    }

    await this.#boss.send(queueName, data, options)
  }
}

const jobManager = new JobManager(boss)

export { JobManager, jobManager }

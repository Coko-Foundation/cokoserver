import { describe, it, expect, beforeEach, vi } from 'vitest'

import { sendEmail, makeTransportConfig } from '../sendEmail'
import SendEmailError from '../SendEmailError'
import config from '../../configManager/config'

vi.mock('nodemailer', async () => {
  const original = await vi.importActual('nodemailer')

  return {
    default: {
      ...original,
      createTestAccount: vi.fn().mockResolvedValue({
        smtp: {
          host: 'smtp.ethereal.email',
          port: 587,
        },
        user: 'user',
        pass: 'pass',
      }),
    },
  }
})

describe('Email', () => {
  const env = process.env.NODE_ENV

  beforeEach(() => {
    config.reset()
    process.env.NODE_ENV = env
  })

  it('sends email', async () => {
    // use mailhog
    await config.init({
      mailer: {
        from: 'Mailer Test <test@example.com>',
        transport: {
          host: 'mailhog',
          port: 1025,
          auth: {
            user: 'user',
            pass: 'pass',
          },
        },
      },
    })

    const mailData = {
      to: 'john@example.com',
      html: 'hello',
    }

    const res = await sendEmail(mailData)
    expect(res.accepted).toHaveLength(1) // the number of recipients
  })

  it('falls back to ethereal when not in production', async () => {
    const created = await makeTransportConfig(config)

    expect(created.transportConfig.host).toBe('smtp.ethereal.email')
    expect(created.testTransportUsed).toBe(true)
  })

  it('does not use ethereal in production', async () => {
    process.env.NODE_ENV = 'production'
    await expect(makeTransportConfig(config)).rejects.toThrow(SendEmailError)
  })

  it('reads config when provided', async () => {
    await config.init({
      mailer: {
        from: 'test@example.com',
        transport: {
          host: 'smtp.fakemail.com',
          port: 587,
          auth: {
            user: 'user',
            pass: 'pass',
          },
        },
      },
    })

    const created = await makeTransportConfig(config)
    expect(created.testTransportUsed).toBe(false)
  })

  it('overrides config when provided values', async () => {
    const overrides = {
      host: 'smtp.fakemail.com',
      port: 587,
      auth: {
        user: 'user',
        pass: 'pass',
      },
    }

    const created = await makeTransportConfig(config, overrides)
    expect(created.testTransportUsed).toBe(false)
  })
})

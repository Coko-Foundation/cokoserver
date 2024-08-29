const nodemailer = require('nodemailer')

const TestConfig = require('../../utils/TestConfig')

const { sendEmail, makeTransportConfig } = require('../sendEmail')
const SendEmailError = require('../SendEmailError')

describe('Email', () => {
  const env = process.env.NODE_ENV

  afterEach(async () => {
    process.env.NODE_ENV = env
  })

  it('sends email', async () => {
    const mailData = {
      to: 'john@example.com',
      html: 'hello',
    }

    const res = await sendEmail(mailData)
    expect(res.accepted).toHaveLength(1) // the number of recipients
  })

  it('falls back to ethereal when not in production', async () => {
    const config = new TestConfig()
    const created = await makeTransportConfig(config)

    expect(created.transportConfig.host).toBe('smtp.ethereal.email')
    expect(created.testTransportUsed).toBe(true)
  })

  it('does not use ethereal in production', async () => {
    process.env.NODE_ENV = 'production'
    const config = new TestConfig()
    await expect(makeTransportConfig(config)).rejects.toThrow(SendEmailError)
  })

  it('reads config when provided', async () => {
    const ethereal = await nodemailer.createTestAccount()

    const config = new TestConfig({
      mailer: {
        transport: {
          ...ethereal.smtp,
          auth: {
            user: ethereal.user,
            pass: ethereal.pass,
          },
        },
      },
    })

    const created = await makeTransportConfig(config)
    expect(created.testTransportUsed).toBe(false)
  })

  it('overrides config when provided values', async () => {
    const ethereal = await nodemailer.createTestAccount()
    const config = new TestConfig()

    const overrides = {
      ...ethereal.smtp,
      auth: {
        user: ethereal.user,
        pass: ethereal.pass,
      },
    }

    const created = await makeTransportConfig(config, overrides)
    expect(created.testTransportUsed).toBe(false)
  })
})

import nodemailer, { SentMessageInfo } from 'nodemailer'

import config from '../configManager/config'
import logger from '../logger'

import SendEmailError from './SendEmailError'
import { MailerTransport } from '../configManager/configSchema'

type TransportConfig = {
  transportConfig: MailerTransport
  testTransportUsed: boolean
}

const makeTransportConfig = async (
  configObject,
  mailerConfigOverrides = {},
): Promise<TransportConfig> => {
  const isProduction = process.env.NODE_ENV === 'production'

  const globalConfig =
    (configObject.has('mailer.transport') &&
      configObject.get('mailer.transport')) ||
    {}

  let configToUse: MailerTransport

  const foundConfig = {
    ...globalConfig,
    ...mailerConfigOverrides,
  }

  const hasConfig =
    Object.keys(foundConfig).length > 0 &&
    foundConfig.host &&
    foundConfig.port &&
    foundConfig.auth?.user &&
    foundConfig.auth?.pass

  let testTransportUsed = false

  if (hasConfig) configToUse = foundConfig

  if (!hasConfig && !isProduction) {
    const ethereal = await nodemailer.createTestAccount()

    configToUse = {
      ...ethereal.smtp,
      auth: {
        user: ethereal.user,
        pass: ethereal.pass,
      },
    }

    testTransportUsed = true
  }

  if (!configToUse) {
    throw new SendEmailError(`Mailer configuration is missing`)
  }

  return {
    transportConfig: configToUse,
    testTransportUsed,
  }
}

const sendEmail = async (
  mailData: any,
  mailerConfigOverrides = {},
): Promise<SentMessageInfo> => {
  try {
    const { transportConfig, testTransportUsed } = await makeTransportConfig(
      config,
      mailerConfigOverrides,
    )

    const transporter = nodemailer.createTransport(transportConfig)

    const info = await transporter.sendMail({
      from: config.get('mailer.from'),
      ...mailData,
    })

    if (testTransportUsed) {
      logger.info(
        `Email preview available at: ${nodemailer.getTestMessageUrl(info)}`,
      )
    }

    return info
  } catch (e) {
    throw new SendEmailError(e)
  }
}

export { sendEmail, makeTransportConfig }

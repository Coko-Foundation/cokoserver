// @ts-nocheck

import nodemailer from 'nodemailer'

import config from '../configManager/config'
import logger from '../logger'

import SendEmailError from './SendEmailError'

const makeTransportConfig = async (
  configObject,
  mailerConfigOverrides = {},
) => {
  const isProduction = process.env.NODE_ENV === 'production'

  const globalConfig =
    configObject.has('mailer.transport') && configObject.get('mailer.transport')

  let configToUse

  const foundConfig = {
    ...globalConfig,
    ...mailerConfigOverrides,
  }

  const hasConfig = Object.keys(foundConfig).length > 0

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

const sendEmail = async (mailData, mailerConfigOverrides = {}) => {
  const { transportConfig, testTransportUsed } = await makeTransportConfig(
    config,
    mailerConfigOverrides,
  )

  const transporter = nodemailer.createTransport(transportConfig)

  try {
    const info = await transporter.sendMail(mailData)

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

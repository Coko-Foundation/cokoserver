import { SentMessageInfo } from 'nodemailer'

import { sendEmail as mailerSendEmail } from './sendEmail'
import logger from '../logger'

import { labels, notificationTypes } from './constants'

const { NOTIFY_SERVICE } = labels
const { EMAIL } = notificationTypes

const sendEmail = async (data): Promise<SentMessageInfo> => {
  const { subject, to, content, text } = data

  const emailData = {
    html: `<div>${content}</div>`,
    subject: `${subject}`,
    text: text || content,
    to,
  }

  logger.info(
    `${NOTIFY_SERVICE} sendEmail: email will be sent with subject ${subject}`,
  )

  return mailerSendEmail(emailData)
}

const notify = (type, data): SentMessageInfo => {
  logger.info(
    `${NOTIFY_SERVICE} notify: notification of type ${type} will be sent`,
  )

  switch (type) {
    case EMAIL:
      try {
        sendEmail(data)
      } catch (e) {
        logger.error(e)
      }
      break
    default:
      throw Error('Notification type is required')
  }
}

export default notify

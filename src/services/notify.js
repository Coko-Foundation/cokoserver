const config = require('config')

const mailer = require('./sendEmail')
const logger = require('../logger')

const {
  labels: { NOTIFY_SERVICE },
  notificationTypes: { EMAIL },
} = require('./constants')

const sendEmail = async data => {
  const { subject, to, content, text } = data

  const emailData = {
    from: config.has('mailer.from') && config.get('mailer.from'),
    html: `<div>${content}</div>`,
    subject: `${subject}`,
    text: text || content,
    to,
  }

  logger.info(
    `${NOTIFY_SERVICE} sendEmail: email will be sent to ${to} with subject ${subject}`,
  )

  return mailer.sendEmail(emailData)
}

const notify = (type, data) => {
  logger.info(
    `${NOTIFY_SERVICE} notify: notification of type ${type} will be sent`,
  )

  switch (type) {
    case EMAIL:
      sendEmail(data)
      break
    default:
      throw Error('Notification type is required')
  }
}

module.exports = notify

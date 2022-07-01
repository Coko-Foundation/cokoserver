const logger = require('@pubsweet/logger')

const config = require('config')
const mailer = require('@pubsweet/component-send-email')

const {
  labels: { NOTIFY_SERVICE },
  notificationTypes: { EMAIL },
} = require('./constants')

const sendEmail = async data => {
  const { content, subject, to } = data

  const emailData = {
    from: config.get('mailer.from'),
    html: `<div>${content}</div>`,
    subject: `${subject}`,
    text: content,
    to,
  }

  logger.info(
    `${NOTIFY_SERVICE} sendEmail: email will be sent to ${to} with subject ${subject}`,
  )
  return mailer.send(emailData)
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

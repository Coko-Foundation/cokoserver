class SendEmailError extends Error {
  constructor(message, max) {
    super(message)

    this.message = `Failed to send email. ${message}`
    this.name = 'SendEmailError'
  }
}

module.exports = SendEmailError

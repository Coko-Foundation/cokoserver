class SendEmailError extends Error {
  constructor(message: string) {
    super(message)

    this.message = `Failed to send email. ${message}`
    this.name = 'SendEmailError'
  }
}

export default SendEmailError

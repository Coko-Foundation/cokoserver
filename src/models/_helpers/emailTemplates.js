const config = require('config')

const { clientUrl } = require('../../utils/urls')

/*
  Email with email verification token to new users
*/
const identityVerification = context => {
  try {
    const { verificationToken, email } = context

    const link = `${clientUrl}/email-verification/${verificationToken}`

    const content = `
        <p>Thank you for signing up!</p>
        <p>Click on <a href="${link}">this link</a> to verify your account.</p>
        <p></p>
        <p>
          If you cannot see the link, copy and paste the following link into your browser to verify your account.
          <br/>
          ${link}
        </p>
      `

    const text = `
      Thank you for signing up!\nCopy and paste the following link into your browser to verify your account.\n\n${link}`

    const data = {
      content,
      text,
      subject: 'Account Verification',
      to: email,
    }

    return data
  } catch (e) {
    throw new Error(e)
  }
}

const passwordUpdate = context => {
  const { email } = context

  const content = `
      <p>
        Your password has been successfully updated.
        <br/>
        If you did not initiate this change, please contact your system administrator.
      </p>
    `

  const data = {
    subject: 'Password changed',
    content,
    to: email,
  }

  return data
}

const requestResetPasswordEmailNotFound = context => {
  const { email } = context

  const content = `
      <p>
        You or someone else tried to change the password of an account using this 
        email address.
  
        <br/>
  
        The requested change failed, as this email does not exist in our database.
  
        <br/>
  
        If this action was performed by you, please use the email address that
        you have connected with your account.
      </p>
    `

  const data = {
    content,
    subject: 'Account access attempted',
    to: email,
  }

  return data
}

const requestResetPassword = context => {
  const { email, token } = context

  const pathToPage = config.has('passwordReset.pathToPage')
    ? config.get('passwordReset.pathToPage')
    : '/password-reset'

  const link = `${clientUrl}${pathToPage}/${token}`

  const content = `
      <p>
        Follow the link below to reset your password.
  
        <br/>
  
        This link will be valid for 24 hours.
      </p>
  
      <p>
        <a href="${link}">Reset your password</a>
      </p>

      <p>
        If you cannot click the link above, paste the following into your
        browser to continue: ${link}  
      </p>
    `

  const text = `Paste the following link into your browser to reset your password.\n${link}\nThe link will be valid for 24 hours.`

  const data = {
    subject: 'Password reset',
    content,
    text,
    to: email,
  }

  return data
}

module.exports = {
  identityVerification,
  requestResetPasswordEmailNotFound,
  requestResetPassword,
  passwordUpdate,
}

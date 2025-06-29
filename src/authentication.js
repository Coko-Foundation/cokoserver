const config = require('config')
const jwt = require('jsonwebtoken')

const BearerStrategy = require('passport-http-bearer').Strategy
const AnonymousStrategy = require('passport-anonymous').Strategy
const LocalStrategy = require('passport-local').Strategy

const logger = require('./logger')
const User = require('./models/user/user.model')

const createToken = user => {
  logger.debug('Creating token for', user.username)
  let expiresIn = 24 * 3600

  if (config.has('tokenExpiresIn')) {
    expiresIn = config.get('tokenExpiresIn')
  }

  return jwt.sign(
    {
      username: user.username,
      id: user.id,
    },
    config.get('secret'),
    { expiresIn },
  )
}

const verifyToken = (token, done) => {
  jwt.verify(token, config.get('secret'), (err, decoded) => {
    if (err) return done(null)

    return done(null, decoded.id, {
      username: decoded.username,
      id: decoded.id,
      token,
    })
  })
}

const verifyPassword = (username, password, done) => {
  const errorMessage = 'Wrong username or password.'
  logger.debug('User finding:', username)

  User.findByUsername(username)
    .then(user => {
      logger.debug('User found:', user.username)
      return Promise.all([user, user.validPassword(password)])
    })
    .then(([user, isValid]) => {
      if (isValid) {
        done(null, user, { id: user.id })
        return
      }

      logger.debug('Invalid password for user:', username)
      done(null, false, { message: errorMessage })
    })
    .catch(err => {
      logger.debug('User not found', err)

      if (err) {
        done(null, false, { message: errorMessage })
      }
    })
}

module.exports = {
  token: {
    create: createToken,
    verify: verifyToken,
  },
  strategies: {
    // no credentials
    anonymous: new AnonymousStrategy(),

    // JSON web token in "Bearer" HTTP header
    bearer: new BearerStrategy(verifyToken),

    // email + password
    local: new LocalStrategy(verifyPassword),
  },
}

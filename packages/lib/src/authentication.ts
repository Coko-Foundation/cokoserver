import jwt from 'jsonwebtoken'

import { Strategy as BearerStrategy } from 'passport-http-bearer'
import { Strategy as AnonymousStrategy } from 'passport-anonymous'
import { Strategy as LocalStrategy } from 'passport-local'

import config from './configManager/config'
import logger from './logger/index'
import User from './models/user/user.model'

const createToken = (user: User): string => {
  logger.info(`Creating token for ${user.username}`)

  const expiresIn = config.get('tokenExpiresIn')

  return jwt.sign(
    {
      username: user.username,
      id: user.id,
    },
    config.get('secret'),
    { expiresIn },
  )
}

const verifyToken = (token: string, done): void => {
  jwt.verify(token, config.get('secret'), (err, decoded) => {
    if (err) return done(null)

    return done(null, decoded.id, {
      username: decoded.username,
      id: decoded.id,
      token,
    })
  })
}

const verifyPassword = (username: string, password: string, done): void => {
  const errorMessage = 'Wrong username or password.'
  logger.debug('User finding:', username)

  User.findOne({ username })
    .then(user => {
      logger.debug('User found:', user.username)
      return Promise.all([user, user.isPasswordValid(password)])
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

export default {
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

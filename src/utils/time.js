const moment = require('moment')

const foreverDate = moment('9999-12-01').utc().toDate()

const getExpirationTime = secondsFromNow => {
  return moment().utc().add(secondsFromNow, 'seconds').toDate()
}

module.exports = {
  getExpirationTime,
  foreverDate,
}

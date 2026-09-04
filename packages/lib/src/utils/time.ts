import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

const foreverDate = dayjs('9999-12-01').utc().toDate()

const getExpirationTime = (secondsFromNow: number): Date => {
  return dayjs().utc().add(secondsFromNow, 'second').toDate()
}

export { getExpirationTime, foreverDate }

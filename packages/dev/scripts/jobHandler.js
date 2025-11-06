/* eslint-disable  no-console */

const handler = (job, context) => {
  const { config } = context

  console.log(job)

  const random = config.has('random') && config.get('random')
  console.log('is random', random)
}

module.exports = handler

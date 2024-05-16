const config = require('config')

const logger = require('../logger')
const useTransaction = require('../models/useTransaction')
const Team = require('../models/team/team.model')

const seedGlobalTeams = async () => {
  logger.info('')
  logger.info('Coko server => Seeding global teams...')

  if (!config.has('teams.global')) {
    logger.info('No global teams declared in config')
    return
  }

  const configGlobalTeams = config.get('teams.global')

  await useTransaction(async trx => {
    await Promise.all(
      Object.keys(configGlobalTeams).map(async k => {
        const teamData = configGlobalTeams[k]

        const exists = await Team.findOne(
          {
            global: true,
            role: teamData.role,
          },
          { trx },
        )

        if (exists) {
          logger.info(`- Global team "${teamData.role}" already exists`)
          return
        }

        await Team.insert(
          {
            ...teamData,
            global: true,
          },
          { trx },
        )

        logger.info(`- Added global team "${teamData.role}"`)
      }),
    )
  })

  logger.info('')
}

module.exports = seedGlobalTeams

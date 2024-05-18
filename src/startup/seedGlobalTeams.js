const config = require('config')
const chalk = require('chalk')

const logger = require('../logger')
const useTransaction = require('../models/useTransaction')
const Team = require('../models/team/team.model')

const seedGlobalTeams = async () => {
  logger.info(`\n${chalk.cyan('Task:')} Seed global teams\n`)

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
          logger.info(
            `${chalk.cyan('\u25cf')} Global team "${
              teamData.role
            }" already exists`,
          )
          return
        }

        await Team.insert(
          {
            ...teamData,
            global: true,
          },
          { trx },
        )

        logger.info(
          `${chalk.cyan('\u25cf')} Added global team "${teamData.role}"`,
        )
      }),
    )
  })
}

module.exports = seedGlobalTeams

const config = require('config')

const { logTask, logTaskItem } = require('../logger/internals')
const useTransaction = require('../models/useTransaction')
const Team = require('../models/team/team.model')

const seedGlobalTeams = async () => {
  logTask('Seed global teams')

  if (!config.has('teams.global')) {
    logTaskItem('No global teams declared in config')
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
          logTaskItem(`Global team "${teamData.role}" already exists`)
          return
        }

        await Team.insert(
          {
            ...teamData,
            global: true,
          },
          { trx },
        )

        logTaskItem(`Added global team "${teamData.role}"`)
      }),
    )
  })
}

module.exports = seedGlobalTeams

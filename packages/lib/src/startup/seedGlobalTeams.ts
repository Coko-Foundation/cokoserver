// @ts-nocheck

import config from '../configManager/config'
import { logTask, logTaskItem } from '../logger/internals'
import useTransaction from '../models/useTransaction'
import Team from '../models/team/team.model'

const seedGlobalTeams = async () => {
  logTask('Seed global teams')

  if (!config.has('teams.global')) {
    logTaskItem('No global teams declared in config')
    return
  }

  const configGlobalTeams = config.get('teams.global')

  await useTransaction(async trx => {
    await Promise.all(
      configGlobalTeams.map(async t => {
        const exists = await Team.findOne(
          {
            global: true,
            role: t.role,
          },
          { trx },
        )

        if (exists) {
          logTaskItem(`Global team "${t.role}" already exists`)
          return
        }

        await Team.insert(
          {
            ...t,
            global: true,
          },
          { trx },
        )

        logTaskItem(`Added global team "${t.role}"`)
      }),
    )
  })
}

export default seedGlobalTeams

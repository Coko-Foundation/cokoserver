import config from '../configManager/config'
import internalLogger from '../logger/internals'
import useTransaction from '../models/useTransaction'
import Team from '../models/team/team.model'

const seedGlobalTeams = async (): Promise<void> => {
  internalLogger.section('Seed global teams')

  if (!config.has('teams.global')) {
    internalLogger.warn('No global teams declared in config')
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
          internalLogger.point(`Global team "${t.role}" already exists`)
          return
        }

        await Team.insert(
          {
            ...t,
            global: true,
          },
          { trx },
        )

        internalLogger.success(`Added global team "${t.role}"`)
      }),
    )
  })
}

export default seedGlobalTeams

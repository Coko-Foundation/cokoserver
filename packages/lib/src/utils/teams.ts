import config from '../configManager/config'
import { type Teams } from '../configManager/configSchema'

function createEnumFromConfig(teamsConfig: Teams, key: string): string[] {
  return Array.from(
    new Set(
      Object.values(teamsConfig)
        .flat()
        .map(t => t[key]),
    ),
  )
}

export function teamDisplayNamesEnum(): string[] {
  const cfg = config.get('teams')
  const rolesEnum = createEnumFromConfig(cfg, 'displayName')
  return rolesEnum
}

export function teamRolesEnum(): string[] {
  const cfg = config.get('teams')
  const rolesEnum = createEnumFromConfig(cfg, 'role')
  return rolesEnum
}

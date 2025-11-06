// @ts-nocheck

import union from 'lodash/union'
import uniq from 'lodash/uniq'

import config from '../../configManager/config'

const globalTeams =
  (config.has('teams.global') && config.get('teams.global')) || []

const nonGlobalTeams =
  (config.has('teams.nonGlobal') && config.get('teams.nonGlobal')) || []

const allTeams = union(globalTeams, nonGlobalTeams)

const flattenAllTeamRoles = uniq(allTeams.map(team => team.role))
const flattenAllTeamDisplayNames = uniq(allTeams.map(team => team.displayName))
const rolesEnum = flattenAllTeamRoles
const displayNamesEnum = flattenAllTeamDisplayNames

export { globalTeams, nonGlobalTeams, rolesEnum, displayNamesEnum }

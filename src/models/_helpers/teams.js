const config = require('config')
const union = require('lodash/union')
const uniq = require('lodash/uniq')

const globalTeams =
  (config.has('teams.global') && config.get('teams.global')) || []

const nonGlobalTeams =
  (config.has('teams.nonGlobal') && config.get('teams.nonGlobal')) || []

const allTeams = union(globalTeams, nonGlobalTeams)

const flattenAllTeamRoles = uniq(allTeams.map(team => team.role))
const flattenAllTeamDisplayNames = uniq(allTeams.map(team => team.displayName))

module.exports = {
  globalTeams,
  nonGlobalTeams,
  rolesEnum: flattenAllTeamRoles,
  displayNamesEnum: flattenAllTeamDisplayNames,
}

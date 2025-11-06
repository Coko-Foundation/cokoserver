import logger from '../../logger'

import TeamMember from './teamMember.model'

import { labels } from './constants'

const { TEAM_MEMBER_LOADER } = labels

const teamMembersBasedOnTeamIdsLoader = async teamIds => {
  try {
    const membersOfAllTeams = await TeamMember.query().whereIn(
      'teamId',
      teamIds,
    )

    return teamIds.map(teamId => {
      const membersOfThisTeam = membersOfAllTeams.filter(
        member => member.teamId === teamId,
      )

      return membersOfThisTeam
    })
  } catch (e) {
    logger.error(
      `${TEAM_MEMBER_LOADER} teamMembersBasedOnTeamIdsLoader: ${e.message}`,
    )
    throw new Error(e)
  }
}

export { teamMembersBasedOnTeamIdsLoader }

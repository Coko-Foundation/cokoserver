import logger from '../../logger'

import Team from './team.model'
import useTransaction from '../useTransaction'
import { labels } from './constants'
import {
  FindOptions,
  QueryResult,
  TrxOption,
  TrxAndRelatedOptions,
} from '../base.model'

const { TEAM_CONTROLLER } = labels

const getTeam = async (
  id,
  options: TrxAndRelatedOptions = {},
): Promise<Team> => {
  try {
    const { trx, ...restOptions } = options
    return useTransaction(
      async tr => {
        logger.info(`${TEAM_CONTROLLER} getTeam: fetching team with id ${id}`)
        return Team.findById(id, { trx: tr, ...restOptions })
      },
      { trx, passedTrxOnly: true },
    )
  } catch (e) {
    logger.error(`${TEAM_CONTROLLER} getTeam: ${e.message}`)
    throw e
  }
}

const getTeams = async (
  where = {},
  options: FindOptions = {},
): Promise<QueryResult<Team>> => {
  const { trx, ...rest } = options
  return Team.find(where, { trx, ...rest })
}

const addTeamMember = async (
  teamId,
  userId,
  options: TrxOption = {},
): Promise<Team> => {
  try {
    const { trx } = options
    // notify
    return useTransaction(
      async tr => {
        logger.info(
          `${TEAM_CONTROLLER} addTeamMember: adding user with id ${userId} to team with id ${teamId}`,
        )
        return Team.addMember(teamId, userId, { trx: tr })
      },
      { trx, passedTrxOnly: true },
    )
  } catch (e) {
    logger.error(`${TEAM_CONTROLLER} addTeamMember: ${e.message}`)
    throw e
  }
}

const removeTeamMember = async (
  teamId,
  userId,
  options: TrxOption = {},
): Promise<Team> => {
  try {
    const { trx } = options
    // notify
    return useTransaction(
      async tr => {
        logger.info(
          `${TEAM_CONTROLLER} removeTeamMember: removing user with id ${userId} from team with id ${teamId}`,
        )
        return Team.removeMember(teamId, userId, { trx: tr })
      },
      { trx, passedTrxOnly: true },
    )
  } catch (e) {
    logger.error(`${TEAM_CONTROLLER} removeTeamMember: ${e.message}`)
    throw e
  }
}

const updateTeamMembership = async (
  teamId,
  members,
  options: TrxOption = {},
): Promise<Team> => {
  try {
    const { trx } = options
    return useTransaction(
      async tr => {
        logger.info(
          `${TEAM_CONTROLLER} updateTeamMembership: updating members of team with id ${teamId}`,
        )
        return Team.updateMembershipByTeamId(teamId, members, { trx: tr })
      },
      { trx, passedTrxOnly: true },
    )
  } catch (e) {
    logger.error(`${TEAM_CONTROLLER} updateTeamMembership: ${e.message}`)
    throw e
  }
}

// const deleteTeam = async (id, options = {}) => {
//   try {
//     const { trx } = options
//     return useTransaction(
//       async tr => {
//         logger.info(
//           `${TEAM_CONTROLLER} deleteTeam: removing team with id ${id}`,
//         )
//         return Team.deleteById(id, { trx: tr })
//       },
//       { trx, passedTrxOnly: true },
//     )
//   } catch (e) {
//     logger.error(`${TEAM_CONTROLLER} deleteTeam: ${e.message}`)
//     throw e
//   }
// }

export {
  getTeam,
  getTeams,
  updateTeamMembership,
  addTeamMember,
  removeTeamMember,
  //   deleteTeam,
}

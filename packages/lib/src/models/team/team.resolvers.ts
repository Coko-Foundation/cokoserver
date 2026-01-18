import logger from '../../logger'
import subscriptionManager from '../../graphql/pubsub'
import { labels } from './constants'
import { subscriptions } from '../user/constants'

import {
  getTeam,
  getTeams,
  updateTeamMembership,
  addTeamMember,
  removeTeamMember,
  // deleteTeam,
} from './team.controller'

import { getUser } from '../user/user.controller'
import TeamMember from '../teamMember/teamMember.model'
import Team from './team.model'
import { QueryResult } from '../base.model'

const { TEAM_RESOLVER } = labels
const { USER_UPDATED } = subscriptions

const broadcastUserUpdated = async (userId: string): Promise<void> => {
  try {
    const updatedUser = await getUser(userId)

    subscriptionManager.publish(USER_UPDATED, {
      userUpdated: updatedUser,
    })
  } catch (e) {
    throw new Error(e.message)
  }
}

const teamResolver = async (_, { id }): Promise<Team> => {
  try {
    logger.info(`${TEAM_RESOLVER} team`)
    return getTeam(id)
  } catch (e) {
    logger.error(`${TEAM_RESOLVER} team: ${e.message}`)
    throw e
  }
}

const teamsResolver = async (_, { filter }): Promise<QueryResult<Team>> => {
  try {
    logger.info(`${TEAM_RESOLVER} teams`)
    return getTeams(filter)
  } catch (e) {
    logger.error(`${TEAM_RESOLVER} teams: ${e.message}`)
    throw e
  }
}

const updateTeamMembershipResolver = async (
  _,
  { teamId, members },
): Promise<Team> => {
  try {
    logger.info(`${TEAM_RESOLVER} updateTeamMembership`)

    const updatedTeam = await updateTeamMembership(teamId, members)

    await Promise.all(members.map(async userId => broadcastUserUpdated(userId)))

    return updatedTeam
  } catch (e) {
    logger.error(`${TEAM_RESOLVER} updateTeamMembership: ${e.message}`)
    throw e
  }
}

const addTeamMemberResolver = async (_, { teamId, userId }): Promise<Team> => {
  try {
    logger.info(`${TEAM_RESOLVER} addTeamMember`)

    const updatedTeam = await addTeamMember(teamId, userId)

    await broadcastUserUpdated(userId)

    return updatedTeam
  } catch (e) {
    logger.error(`${TEAM_RESOLVER} addTeamMember: ${e.message}`)
    throw e
  }
}

const removeTeamMemberResolver = async (
  _,
  { teamId, userId },
): Promise<Team> => {
  try {
    logger.info(`${TEAM_RESOLVER} removeTeamMember`)

    const updatedTeam = await removeTeamMember(teamId, userId)

    await broadcastUserUpdated(userId)

    return updatedTeam
  } catch (e) {
    logger.error(`${TEAM_RESOLVER} removeTeamMember: ${e.message}`)
    throw e
  }
}

// const deleteTeamResolver = async (_, { id }) => {
//   try {
//     logger.info(`${TEAM_RESOLVER} deleteTeam`)
//     return deleteTeam(id)
//   } catch (e) {
//     logger.error(`${TEAM_RESOLVER} deleteTeam: ${e.message}`)
//     throw e
//   }
// }

const teamMemberResolver = async (
  team,
  { currentUserOnly },
  ctx,
): Promise<TeamMember[]> => {
  // const { id } = team
  // return ctx.loaders.TeamMember.teamMembersBasedOnTeamIdsLoader.load(id)

  const where = {
    teamId: team.id,
    ...(currentUserOnly ? { userId: ctx.userId } : {}),
  }

  const { result: members } = await TeamMember.find(where)
  return members
}

const resolvers = {
  Query: {
    team: teamResolver,
    teams: teamsResolver,
  },
  Mutation: {
    updateTeamMembership: updateTeamMembershipResolver,
    addTeamMember: addTeamMemberResolver,
    removeTeamMember: removeTeamMemberResolver,
    // deleteTeam:deleteTeamResolver,
  },
  Team: {
    members: teamMemberResolver,
  },
}

export default resolvers

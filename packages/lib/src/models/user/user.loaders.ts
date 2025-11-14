import logger from '../../logger'
import User from './user.model'
import { labels } from './constants'

const { USER_LOADER } = labels

const usersBasedOnTeamMemberIdsLoader = async (userIds): Promise<User[]> => {
  try {
    const teamMemberUsers = await User.query().whereIn('id', userIds)

    return userIds.map(userId =>
      teamMemberUsers.find(user => user.id === userId),
    )
  } catch (e) {
    logger.error(`${USER_LOADER} usersBasedOnTeamMemberIdsLoader: ${e.message}`)
    throw e
  }
}

export { usersBasedOnTeamMemberIdsLoader }

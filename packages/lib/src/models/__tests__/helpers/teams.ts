import { v4 as uuid } from 'uuid'

import User from '../../user/user.model'
import Team from '../../team/team.model'

const createGlobalTeamWithUsers = async (): Promise<{
  team: Team
  user: User
}> => {
  const team = await Team.insert({
    role: 'editor',
    displayName: 'Editor',
    global: true,
  })

  const user = await User.insert({})

  await Team.addMember(team.id, user.id)
  return { team, user }
}

const createLocalTeamWithUsers = async (): Promise<{
  team: Team
  user: User
}> => {
  const team = await Team.insert({
    role: 'editor',
    displayName: 'Editor',
    global: false,
    objectId: uuid(),
    objectType: 'someObjectType',
  })

  const user = await User.insert({})

  await Team.addMember(team.id, user.id)
  return { team, user }
}

const createChatChannelTeamWithUsers = async (
  chatChannelId: string,
): Promise<{
  team: Team
  user: User
}> => {
  const team = await Team.insert({
    role: 'editor',
    displayName: 'Editor',
    global: false,
    objectId: chatChannelId,
    objectType: 'chatChannel',
  })

  const user = await User.insert({})

  await Team.addMember(team.id, user.id)
  return { team, user }
}

export {
  createChatChannelTeamWithUsers,
  createGlobalTeamWithUsers,
  createLocalTeamWithUsers,
}

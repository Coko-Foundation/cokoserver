const { v4: uuid } = require('uuid')
const { Team, User } = require('../..')

const createGlobalTeamWithUsers = async () => {
  try {
    const team = await Team.insert({
      role: 'editor',
      displayName: 'Editor',
      global: true,
    })

    const user = await User.insert({})

    await Team.addMember(team.id, user.id)
    return { team, user }
  } catch (e) {
    throw new Error(e)
  }
}

const createLocalTeamWithUsers = async () => {
  try {
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
  } catch (e) {
    throw new Error(e)
  }
}

const createChatChannelTeamWithUsers = async chatChannelId => {
  try {
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
  } catch (e) {
    throw new Error(e)
  }
}

module.exports = {
  createChatChannelTeamWithUsers,
  createGlobalTeamWithUsers,
  createLocalTeamWithUsers,
}

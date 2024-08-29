const logger = require('../../logger')

const {
  labels: { CHAT_CHANNEL_RESOLVER },
} = require('./constants')

const { getChatChannel, getChatChannels } = require('./chatChannel.controller')

const chatChannelResolver = async (_, { id }, ctx) => {
  try {
    logger.info(`${CHAT_CHANNEL_RESOLVER} getChatChannel`)
    return getChatChannel(id)
  } catch (e) {
    logger.error(`${CHAT_CHANNEL_RESOLVER} getChatChannel: ${e.message}`)
    throw new Error(e)
  }
}

const chatChannelsResolver = async (_, { filter }, ctx) => {
  try {
    logger.info(`${CHAT_CHANNEL_RESOLVER} getChatChannels`)
    return getChatChannels(filter)
  } catch (e) {
    logger.error(`${CHAT_CHANNEL_RESOLVER} getChatChannels: ${e.message}`)
    throw new Error(e)
  }
}

module.exports = {
  Query: {
    chatChannel: chatChannelResolver,
    chatChannels: chatChannelsResolver,
  },
  ChatChannel: {
    async messages(chatChannel, _, ctx) {
      const { id } = chatChannel
      return ctx.loaders.ChatMessage.messagesBasedOnChatChannelIdsLoader.load(
        id,
      )
    },
  },
}

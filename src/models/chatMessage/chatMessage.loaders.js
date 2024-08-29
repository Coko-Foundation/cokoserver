const logger = require('../../logger')

const ChatMessage = require('./chatMessage.model')

const {
  labels: { CHAT_MESSAGE_LOADER },
} = require('./constants')

const messagesBasedOnChatChannelIdsLoader = async chatChannelIds => {
  try {
    const chatChannelMessages = await ChatMessage.query().whereIn(
      'chatChannelId',
      chatChannelIds,
    )

    return chatChannelIds.map(chatChannelId =>
      chatChannelMessages.filter(
        chatMessage => chatMessage.chatChannelId === chatChannelId,
      ),
    )
  } catch (e) {
    logger.error(
      `${CHAT_MESSAGE_LOADER} messagesBasedOnChatChannelIdsLoader: ${e.message}`,
    )
    throw new Error(e)
  }
}

module.exports = {
  messagesBasedOnChatChannelIdsLoader,
}

import logger from '../../logger'
import ChatMessage from './chatMessage.model'
import { labels } from './constants'

const { CHAT_MESSAGE_LOADER } = labels

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
    throw e
  }
}

export { messagesBasedOnChatChannelIdsLoader }

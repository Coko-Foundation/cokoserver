import logger from '../../logger'
import { labels } from './constants'
import { getChatChannel, getChatChannels } from './chatChannel.controller'
import ChatChannel from './chatChannel.model'
import ChatMessage from '../chatMessage/chatMessage.model'
import { QueryResult } from '../base.model'

const { CHAT_CHANNEL_RESOLVER } = labels

const chatChannelResolver = async (_, { id }): Promise<ChatChannel> => {
  try {
    logger.info(`${CHAT_CHANNEL_RESOLVER} getChatChannel`)
    return getChatChannel(id)
  } catch (e) {
    logger.error(`${CHAT_CHANNEL_RESOLVER} getChatChannel: ${e.message}`)
    throw e
  }
}

const chatChannelsResolver = async (
  _,
  { filter },
): Promise<QueryResult<ChatChannel>> => {
  try {
    logger.info(`${CHAT_CHANNEL_RESOLVER} getChatChannels`)
    return getChatChannels(filter)
  } catch (e) {
    logger.error(`${CHAT_CHANNEL_RESOLVER} getChatChannels: ${e.message}`)
    throw e
  }
}

const channelMessagesResolver = async (
  chatChannel: ChatChannel,
  _,
  ctx,
): Promise<ChatMessage[]> => {
  const { id } = chatChannel
  return ctx.loaders.ChatMessage.messagesBasedOnChatChannelIdsLoader.load(id)
}

const resolvers = {
  Query: {
    chatChannel: chatChannelResolver,
    chatChannels: chatChannelsResolver,
  },
  ChatChannel: {
    messages: channelMessagesResolver,
  },
}

export default resolvers

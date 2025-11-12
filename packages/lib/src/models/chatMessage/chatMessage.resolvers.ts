import logger from '../../logger'

import { labels } from './constants'

import {
  sendMessage,
  deleteMessage,
  editMessage,
} from './chatMessage.controller'

const { CHAT_MESSAGE_RESOLVER } = labels

const sendMessageResolver = async (_, { input }) => {
  try {
    const { chatChannelId, content, userId, mentions } = input
    logger.info(`${CHAT_MESSAGE_RESOLVER} sendMessage`)
    return sendMessage(chatChannelId, content, userId, mentions)
  } catch (e) {
    logger.error(`${CHAT_MESSAGE_RESOLVER} sendMessage: ${e.message}`)
    throw e
  }
}

const editMessageResolver = async (_, { input }) => {
  try {
    const { id, content, mentions } = input
    logger.info(`${CHAT_MESSAGE_RESOLVER} editMessage`)
    return editMessage(id, content, mentions)
  } catch (e) {
    logger.error(`${CHAT_MESSAGE_RESOLVER} editMessage: ${e.message}`)
    throw e
  }
}

const deleteMessageResolver = async (_, { id }) => {
  try {
    logger.info(`${CHAT_MESSAGE_RESOLVER} deleteMessage`)
    return deleteMessage(id)
  } catch (e) {
    logger.error(`${CHAT_MESSAGE_RESOLVER} deleteMessage: ${e.message}`)
    throw e
  }
}

const resolvers = {
  Mutation: {
    sendChatMessage: sendMessageResolver,
    editChatMessage: editMessageResolver,
    deleteChatMessage: deleteMessageResolver,
  },
}

export default resolvers

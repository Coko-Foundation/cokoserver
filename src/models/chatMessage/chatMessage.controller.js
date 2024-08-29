const logger = require('../../logger')

const ChatMessage = require('./chatMessage.model')
const useTransaction = require('../useTransaction')

const {
  labels: { CHAT_MESSAGE_CONTROLLER },
} = require('./constants')

const sendMessage = async (
  chatChannelId,
  content,
  userId,
  mentions = [],
  options = {},
) => {
  try {
    const { trx, ...restOptions } = options

    const newMessage = await useTransaction(
      async tr => {
        logger.info(
          `${CHAT_MESSAGE_CONTROLLER} sendMessage: creating a new message for chat channel with id ${chatChannelId}`,
        )
        return ChatMessage.insert(
          { chatChannelId, userId, content, mentions },
          { trx: tr, ...restOptions },
        )
      },
      { trx, passedTrxOnly: true },
    )

    // notify?
    return newMessage
  } catch (e) {
    logger.error(`${CHAT_MESSAGE_CONTROLLER} sendMessage: ${e.message}`)
    throw new Error(e)
  }
}

const editMessage = async (id, content, mentions, options = {}) => {
  try {
    const { trx, ...restOptions } = options
    return useTransaction(
      async tr => {
        logger.info(
          `${CHAT_MESSAGE_CONTROLLER} editMessage: patching message with id ${id}`,
        )
        const patchData = { content }

        if (mentions) {
          patchData.mentions = mentions
        }

        return ChatMessage.patchAndFetchById(id, patchData, {
          trx: tr,
          ...restOptions,
        })
      },
      { trx, passedTrxOnly: true },
    )
  } catch (e) {
    logger.error(`${CHAT_MESSAGE_CONTROLLER} editMessage: ${e.message}`)
    throw new Error(e)
  }
}

const deleteMessage = async (id, options = {}) => {
  try {
    const { trx } = options
    return useTransaction(
      async tr => {
        logger.info(
          `${CHAT_MESSAGE_CONTROLLER} deleteMessage: deleting message with id ${id}`,
        )
        return ChatMessage.deleteById(id, { trx: tr })
      },
      { trx, passedTrxOnly: true },
    )
  } catch (e) {
    logger.error(`${CHAT_MESSAGE_CONTROLLER} deleteMessage: ${e.message}`)
    throw new Error(e)
  }
}

module.exports = {
  sendMessage,
  editMessage,
  deleteMessage,
}

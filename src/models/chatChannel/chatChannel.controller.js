const logger = require('../../logger')

const ChatChannel = require('./chatChannel.model')
const useTransaction = require('../useTransaction')

const {
  labels: { CHAT_CHANNEL_CONTROLLER },
} = require('./constants')

const getChatChannel = async (id, options = {}) => {
  try {
    const { trx, ...restOptions } = options
    return useTransaction(
      async tr => {
        logger.info(
          `${CHAT_CHANNEL_CONTROLLER} getChatChannel: fetching chat Channel with id ${id}`,
        )
        return ChatChannel.findById(id, { trx: tr, ...restOptions })
      },
      { trx, passedTrxOnly: true },
    )
  } catch (e) {
    logger.error(`${CHAT_CHANNEL_CONTROLLER} getChatChannel: ${e.message}`)
    throw new Error(e)
  }
}

const getChatChannels = async (where = {}, options = {}) => {
  const { trx, ...rest } = options
  return ChatChannel.find(where, { trx, ...rest })
}

module.exports = {
  getChatChannel,
  getChatChannels,
}

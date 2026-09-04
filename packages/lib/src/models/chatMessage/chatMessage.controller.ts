import { PartialModelObject } from 'objection'
import logger from '../../logger'

import ChatMessage from './chatMessage.model'
import useTransaction from '../useTransaction'

import { labels } from './constants'
import { TrxAndRelatedOptions, TrxOption } from '../base.model'

const { CHAT_MESSAGE_CONTROLLER } = labels

const sendMessage = async (
  chatChannelId: string,
  content: string,
  userId: string,
  mentions = [],
  options: TrxAndRelatedOptions = {},
): Promise<ChatMessage> => {
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
    throw e
  }
}

const editMessage = async (
  id: string,
  content: string,
  mentions?: string[],
  options: TrxAndRelatedOptions = {},
): Promise<ChatMessage> => {
  try {
    const { trx, ...restOptions } = options
    return useTransaction(
      async tr => {
        logger.info(
          `${CHAT_MESSAGE_CONTROLLER} editMessage: patching message with id ${id}`,
        )
        const patchData = { content } as PartialModelObject<ChatMessage>

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
    throw e
  }
}

const deleteMessage = async (
  id: string,
  options: TrxOption = {},
): Promise<number> => {
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
    throw e
  }
}

export { sendMessage, editMessage, deleteMessage }

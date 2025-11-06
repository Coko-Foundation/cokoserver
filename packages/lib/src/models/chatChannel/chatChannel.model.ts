// @ts-nocheck

import BaseModel from '../base.model'

import ChatMessage from '../chatMessage/chatMessage.model'
import { id } from '../_helpers/types'

class ChatChannel extends BaseModel {
  constructor(properties) {
    super(properties)
    this.type = 'chatChannel'
  }

  static get tableName() {
    return 'chatChannels'
  }

  static get schema() {
    return {
      type: 'object',
      required: ['chatType', 'relatedObjectId'],
      properties: {
        chatType: {
          type: 'string',
        },
        relatedObjectId: id,
      },
    }
  }

  static get relationMappings() {
    return {
      messages: {
        relation: BaseModel.HasManyRelation,
        modelClass: ChatMessage,
        join: {
          from: 'chatMessages.chatChannelId',
          to: 'chatChannels.id',
        },
      },
    }
  }
}

export default ChatChannel

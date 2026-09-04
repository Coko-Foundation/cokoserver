import { RelationMappings } from 'objection'

import BaseModel from '../base.model'
import ChatMessage from '../chatMessage/chatMessage.model'
import { id } from '../_helpers/types'

class ChatChannel extends BaseModel {
  chatType!: string
  relatedObjectId!: string

  messages!: ChatMessage[]

  constructor() {
    super()
    this.type = 'chatChannel'
  }

  static get tableName(): string {
    return 'chatChannels'
  }

  static get schema(): object {
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

  static get relationMappings(): RelationMappings {
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

import { RelationMappings } from 'objection'

import BaseModel from '../base.model'
import User from '../user/user.model'

import {
  id,
  stringNotEmpty,
  booleanDefaultFalse,
  arrayOfIds,
} from '../_helpers/types'

class ChatMessage extends BaseModel {
  content!: string
  chatChannelId!: string
  userId!: string
  mentions!: string[]
  isDeleted!: boolean

  user!: User

  constructor() {
    super()
    this.type = 'chatMessage'
  }

  static get tableName(): string {
    return 'chatMessages'
  }

  static get schema(): object {
    return {
      type: 'object',
      required: ['content', 'chatChannelId', 'userId'],
      properties: {
        content: stringNotEmpty,
        chatChannelId: id,
        userId: id,
        mentions: arrayOfIds,
        isDeleted: booleanDefaultFalse,
      },
    }
  }

  static get relationMappings(): RelationMappings {
    return {
      user: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'chatMessages.userId',
          to: 'users.id',
        },
      },
    }
  }
}

export default ChatMessage

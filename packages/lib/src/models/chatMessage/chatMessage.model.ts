import BaseModel from '../base.model'
import User from '../user/user.model'

import {
  id,
  stringNotEmpty,
  booleanDefaultFalse,
  arrayOfIds,
} from '../_helpers/types'

class ChatMessage extends BaseModel {
  constructor(properties) {
    super(properties)
    this.type = 'chatMessage'
  }

  static get tableName() {
    return 'chatMessages'
  }

  static get schema() {
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

  static get relationMappings() {
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

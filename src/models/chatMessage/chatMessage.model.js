const BaseModel = require('../base.model')

const {
  id,
  stringNotEmpty,
  booleanDefaultFalse,
  arrayOfIds,
} = require('../_helpers/types')

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
    /* eslint-disable-next-line global-require */
    const User = require('../user/user.model')

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

module.exports = ChatMessage

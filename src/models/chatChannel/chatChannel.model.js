const BaseModel = require('../base.model')

const { id } = require('../_helpers/types')

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
    /* eslint-disable-next-line global-require */
    const ChatMessage = require('../chatMessage/chatMessage.model')

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

module.exports = ChatChannel

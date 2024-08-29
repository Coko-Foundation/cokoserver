const BaseModel = require('../base.model')

const {
  id,
  stringNotEmpty,
  stringNullable,
  object,
  objectNullable,
} = require('../_helpers/types')

const affectedObject = {
  type: 'object',
  additionalProperties: false,
  required: ['id', 'objectType'],
  properties: {
    id,
    objectType: stringNotEmpty,
  },
}

const affectedObjects = {
  type: 'array',
  default: [],
  items: affectedObject,
}

class ActivityLog extends BaseModel {
  constructor(properties) {
    super(properties)
    this.type = 'activityLog'
  }

  static get tableName() {
    return 'activityLogs'
  }

  static get schema() {
    return {
      type: 'object',
      required: ['actorId', 'actionType'],
      properties: {
        actorId: id,
        actionType: stringNotEmpty,
        message: stringNullable,
        valueBefore: objectNullable,
        valueAfter: objectNullable,
        affectedObjects,
        additionalData: object,
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
          from: 'activityLogs.actorId',
          to: 'users.id',
        },
      },
    }
  }
}

module.exports = ActivityLog
